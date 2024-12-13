import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Queue from 'bull';

// Initialize Bull queue
const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, data, parentId, isPublic = false } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    const parentFile = parentId
      ? await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId), userId: ObjectId(userId) })
      : null;
    if (parentId && (!parentFile || parentFile.type !== 'folder')) {
      return res.status(400).json({ error: 'Parent not found' });
    }

    const newFile = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId || 0,
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json({ id: result.insertedId, ...newFile });
    }

    const localPath = `/tmp/files_manager/${newFile.name}`;
    newFile.localPath = localPath;

    // Save the file locally
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    // Save file info in DB
    const result = await dbClient.db.collection('files').insertOne(newFile);

    // Add job to Bull queue for generating thumbnails
    if (type === 'image') {
      fileQueue.add({ userId, fileId: result.insertedId });
    }

    return res.status(201).json({ id: result.insertedId, ...newFile });
  }

  static async getFile(req, res) {
    const fileId = req.params.id;
    const size = req.query.size;

    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId) });
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (file.type === 'folder') return res.status(400).json({ error: "A folder doesn't have content" });

    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!file.isPublic && (!userId || file.userId.toString() !== userId.toString())) {
      return res.status(404).json({ error: 'Not found' });
    }

    let filePath = file.localPath;

    // Check if size query parameter is provided for thumbnails
    if (size && ['100', '250', '500'].includes(size)) {
      filePath = `${filePath}_${size}`;
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);

    const fileContent = fs.readFileSync(filePath);
    return res.status(200).send(fileContent);
  }
}

export default FilesController;
