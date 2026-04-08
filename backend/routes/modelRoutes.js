const express = require('express');
const AIModel = require('../models/AIModel');
const router = express.Router();

// 获取当前模型
router.get('/current', async (req, res) => {
  try {
    const currentModel = await AIModel.findOne({ status: 'active' })
      .sort({ version: -1 });
    
    if (!currentModel) {
      return res.status(404).json({ error: '当前模型未找到' });
    }
    
    res.json(currentModel);
  } catch (error) {
    console.error('获取当前模型失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取模型列表
router.get('/list', async (req, res) => {
  try {
    const models = await AIModel.find()
      .sort({ version: -1 });
    
    res.json(models);
  } catch (error) {
    console.error('获取模型列表失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取模型详情
router.get('/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    const model = await AIModel.findOne({ modelId });
    
    if (!model) {
      return res.status(404).json({ error: '模型未找到' });
    }
    
    res.json(model);
  } catch (error) {
    console.error('获取模型详情失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 更新模型性能
router.put('/:modelId/performance', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { performance } = req.body;
    
    const updatedModel = await AIModel.findOneAndUpdate(
      { modelId },
      { 
        performance,
        lastUpdated: new Date()
      },
      { new: true }
    );
    
    if (!updatedModel) {
      return res.status(404).json({ error: '模型未找到' });
    }
    
    res.json(updatedModel);
  } catch (error) {
    console.error('更新模型性能失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 创建新模型版本
router.post('/new', async (req, res) => {
  try {
    const { modelData, performance, description } = req.body;
    
    // 获取当前最新版本
    const latestModel = await AIModel.findOne()
      .sort({ version: -1 });
    
    const newVersion = latestModel ? latestModel.version + 1 : 1;
    
    const newModel = new AIModel({
      modelId: `model_v${newVersion}`,
      modelData,
      performance: performance || {},
      version: newVersion,
      description: description || `模型版本 ${newVersion}`,
      status: 'active'
    });
    
    // 将旧模型设置为非活跃
    if (latestModel) {
      await AIModel.findByIdAndUpdate(latestModel._id, { status: 'inactive' });
    }
    
    await newModel.save();
    
    res.json(newModel);
  } catch (error) {
    console.error('创建新模型版本失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;