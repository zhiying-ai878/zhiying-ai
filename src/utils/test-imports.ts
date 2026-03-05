// 测试导入
import { getLLM } from './llmIntegration';
import { createModel } from './machineLearningModel';

console.log('测试导入成功');
const llm = getLLM();
const model = createModel('lstm');
console.log('创建实例成功');
