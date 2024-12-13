import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const redisKey = `auth_${token}`;
    const userId = await redisClient.get(redisKey);

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const filesCollection = dbClient.db.collection('files');
    let parentFile = null;

    if (parentId !== 0) {
      parentFile = await filesCollection.findOne({ _id: dbClient.client.ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: dbClient.client.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : dbClient.client.ObjectId(parentId),
    };

    if (type === 'folder') {
      const result = await filesCollection.insertOne(fileDocument);
      fileDocument.id = result.insertedId;
      return res.status(201).json(fileDocument);
    }

    // Handle files (type: file | image)
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    await fs.mkdir(folderPath, { recursive: true });
    const localPath = path.join(folderPath, uuidv4());

    try {
      const fileData = Buffer.from(data, 'base64');
      await fs.writeFile(localPath, fileData);
      fileDocument.localPath = localPath;

      const result = await filesCollection.insertOne(fileDocument);
      fileDocument.id = result.insertedId;

      return res.status(201).json(fileDocument);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error saving the file' });
    }
  }
}

export default FilesController;
