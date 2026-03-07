class ModelVersionControl {
    constructor() {
        Object.defineProperty(this, "modelVersions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "abTests", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.loadFromStorage();
    }
    static getInstance() {
        if (!ModelVersionControl.instance) {
            ModelVersionControl.instance = new ModelVersionControl();
        }
        return ModelVersionControl.instance;
    }
    loadFromStorage() {
        try {
            const modelVersionsData = localStorage.getItem('aiModelVersions');
            const abTestsData = localStorage.getItem('aiABTests');
            if (modelVersionsData)
                this.modelVersions = JSON.parse(modelVersionsData);
            if (abTestsData)
                this.abTests = JSON.parse(abTestsData);
        }
        catch (error) {
            console.error('加载模型版本数据失败:', error);
        }
    }
    saveToStorage() {
        try {
            localStorage.setItem('aiModelVersions', JSON.stringify(this.modelVersions));
            localStorage.setItem('aiABTests', JSON.stringify(this.abTests));
        }
        catch (error) {
            console.error('保存模型版本数据失败:', error);
        }
    }
    createModelVersion(name, modelType, description, metrics, createdBy = 'system') {
        const version = `v${this.modelVersions.length + 1}.0.0`;
        const model = {
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
    getModelVersions() {
        return this.modelVersions;
    }
    activateModelVersion(modelId) {
        const model = this.modelVersions.find(m => m.id === modelId);
        if (!model)
            return null;
        this.modelVersions.forEach(m => {
            m.isActive = m.id === modelId;
        });
        this.saveToStorage();
        return model;
    }
    deprecateModelVersion(modelId) {
        const model = this.modelVersions.find(m => m.id === modelId);
        if (!model)
            return null;
        model.isDeprecated = true;
        model.isActive = false;
        this.saveToStorage();
        return model;
    }
    createABTest(name, description, modelAId, modelBId, trafficSplit = 50) {
        const abTest = {
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
    getABTests() {
        return this.abTests;
    }
    completeABTest(abTestId, results) {
        const abTest = this.abTests.find(t => t.id === abTestId);
        if (!abTest)
            return null;
        abTest.status = 'completed';
        abTest.endDate = Date.now();
        abTest.results = results;
        this.saveToStorage();
        return abTest;
    }
}
let modelVersionControlInstance = null;
export const getModelVersionControl = () => {
    if (!modelVersionControlInstance) {
        modelVersionControlInstance = ModelVersionControl.getInstance();
    }
    return modelVersionControlInstance;
};
