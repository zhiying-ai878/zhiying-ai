export interface ModelVersion {
  id: string;
  version: string;
  name: string;
  modelType: 'LSTM' | 'DNN' | 'simpleNN' | 'ensemble';
  createdAt: number;
  createdBy: string;
  description: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  isActive: boolean;
  isDeprecated: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  modelAId: string;
  modelBId: string;
  startDate: number;
  endDate?: number;
  status: 'running' | 'completed' | 'paused';
  trafficSplit: number;
  results?: {
    modelAPerformance: any;
    modelBPerformance: any;
    winner?: 'A' | 'B' | 'tie';
    confidence: number;
  };
}

class ModelVersionControl {
  private static instance: ModelVersionControl;
  private modelVersions: ModelVersion[] = [];
  private abTests: ABTest[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ModelVersionControl {
    if (!ModelVersionControl.instance) {
      ModelVersionControl.instance = new ModelVersionControl();
    }
    return ModelVersionControl.instance;
  }

  private loadFromStorage(): void {
    try {
      const modelVersionsData = localStorage.getItem('aiModelVersions');
      const abTestsData = localStorage.getItem('aiABTests');
      if (modelVersionsData) this.modelVersions = JSON.parse(modelVersionsData);
      if (abTestsData) this.abTests = JSON.parse(abTestsData);
    } catch (error) {
      console.error('加载模型版本数据失败:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('aiModelVersions', JSON.stringify(this.modelVersions));
      localStorage.setItem('aiABTests', JSON.stringify(this.abTests));
    } catch (error) {
      console.error('保存模型版本数据失败:', error);
    }
  }

  createModelVersion(
    name: string,
    modelType: 'LSTM' | 'DNN' | 'simpleNN' | 'ensemble',
    description: string,
    metrics: ModelVersion['metrics'],
    createdBy: string = 'system'
  ): ModelVersion {
    const version = `v${this.modelVersions.length + 1}.0.0`;
    const model: ModelVersion = {
      id: `model_${Date.now()}`,
      version,
      name,
      modelType,
      createdAt: Date.now(),
      createdBy,
      description,
      metrics,
      isActive: this.modelVersions.length === 0,
      isDeprecated: false
    };
    this.modelVersions.push(model);
    this.saveToStorage();
    return model;
  }

  getModelVersions(): ModelVersion[] {
    return this.modelVersions;
  }

  activateModelVersion(modelId: string): ModelVersion | null {
    const model = this.modelVersions.find(m => m.id === modelId);
    if (!model) return null;
    this.modelVersions.forEach(m => {
      m.isActive = m.id === modelId;
    });
    this.saveToStorage();
    return model;
  }

  deprecateModelVersion(modelId: string): ModelVersion | null {
    const model = this.modelVersions.find(m => m.id === modelId);
    if (!model) return null;
    model.isDeprecated = true;
    model.isActive = false;
    this.saveToStorage();
    return model;
  }

  createABTest(
    name: string,
    description: string,
    modelAId: string,
    modelBId: string,
    trafficSplit: number = 50
  ): ABTest {
    const abTest: ABTest = {
      id: `abtest_${Date.now()}`,
      name,
      description,
      modelAId,
      modelBId,
      startDate: Date.now(),
      status: 'running',
      trafficSplit
    };
    this.abTests.push(abTest);
    this.saveToStorage();
    return abTest;
  }

  getABTests(): ABTest[] {
    return this.abTests;
  }

  completeABTest(abTestId: string, results: ABTest['results']): ABTest | null {
    const abTest = this.abTests.find(t => t.id === abTestId);
    if (!abTest) return null;
    abTest.status = 'completed';
    abTest.endDate = Date.now();
    abTest.results = results;
    this.saveToStorage();
    return abTest;
  }
}

let modelVersionControlInstance: ModelVersionControl | null = null;

export const getModelVersionControl = (): ModelVersionControl => {
  if (!modelVersionControlInstance) {
    modelVersionControlInstance = ModelVersionControl.getInstance();
  }
  return modelVersionControlInstance;
};
