// 测试模块导入
import { getLLM } from './src/utils/llmIntegration';
import { createModel } from './src/utils/machineLearningModel';

console.log('测试模块导入成功');
const llm = getLLM();
const model = createModel('lstm');
console.log('创建实例成功');
