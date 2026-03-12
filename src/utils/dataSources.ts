// 简化的数据源管理模块

export interface NewsData {
  id: string;
  title: string;
  content: string;
  time: string;
  source: string;
  sentiment: number;
  relatedStocks: string[];
  impact: 'high' | 'medium' | 'low';
  category: '宏观经济' | '行业新闻' | '公司新闻' | '政策法规';
  heat: number;
}

export const getNewsData = async (): Promise<NewsData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [];
};
