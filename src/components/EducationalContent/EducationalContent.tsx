import React, { useState, useEffect, useCallback } from 'react'
import { Card, Tabs, List, Button, Space, Tag, Badge, Divider, Modal, Spin, message, Row, Col } from 'antd'
import { BookOutlined, VideoCameraOutlined, FileTextOutlined, StarOutlined, ShareAltOutlined, UserOutlined, LikeOutlined, MessageOutlined, DownloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

interface Course {
  id: string
  title: string
  description: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  instructor: string
  rating: number
  views: number
  likes: number
  content: string
  image: string
}

interface Article {
  id: string
  title: string
  content: string
  author: string
  publishDate: string
  readTime: string
  views: number
  likes: number
  category: string
  tags: string[]
}

interface Video {
  id: string
  title: string
  description: string
  duration: string
  instructor: string
  publishDate: string
  views: number
  likes: number
  category: string
  thumbnail: string
}

const EducationalContent: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // 模拟课程数据
  const courses: Course[] = [
    {
      id: '1',
      title: '股票基础知识入门',
      description: '适合初学者的股票投资基础知识，包括股票市场运作原理、基本术语和投资策略',
      category: '基础知识',
      level: 'beginner',
      duration: '6小时',
      instructor: '张教授',
      rating: 4.8,
      views: 12500,
      likes: 3200,
      content: '本课程将从最基础的股票概念讲起，包括股票的定义、股票市场的运作机制、如何阅读股票行情、基本的技术分析和基本面分析方法等。通过本课程的学习，您将掌握股票投资的基础知识，为后续的投资实践打下坚实的基础。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stock%20market%20basics%20course%20thumbnail%20with%20chart%20and%20financial%20symbols&image_size=square_hd'
    },
    {
      id: '2',
      title: '技术分析进阶',
      description: '深入学习技术分析方法，包括K线形态、技术指标和趋势分析',
      category: '技术分析',
      level: 'intermediate',
      duration: '8小时',
      instructor: '李分析师',
      rating: 4.7,
      views: 8900,
      likes: 2100,
      content: '本课程将深入讲解技术分析的核心方法，包括K线形态识别、常用技术指标（如MACD、RSI、KDJ等）的应用、趋势线和支撑阻力位的绘制与应用、量价关系分析等。通过本课程的学习，您将能够运用技术分析方法分析股票走势，制定更有效的投资策略。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=technical%20analysis%20advanced%20course%20thumbnail%20with%20charts%20and%20indicators&image_size=square_hd'
    },
    {
      id: '3',
      title: '基本面分析实战',
      description: '学习如何分析公司财务报表、行业前景和宏观经济对股票的影响',
      category: '基本面分析',
      level: 'intermediate',
      duration: '10小时',
      instructor: '王分析师',
      rating: 4.9,
      views: 6700,
      likes: 1800,
      content: '本课程将详细讲解基本面分析的方法和技巧，包括如何阅读和分析公司财务报表、如何评估公司的盈利能力和成长性、如何分析行业前景和竞争格局、如何评估宏观经济对股票的影响等。通过本课程的学习，您将能够从基本面角度评估股票的内在价值，做出更明智的投资决策。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fundamental%20analysis%20course%20thumbnail%20with%20financial%20statements%20and%20charts&image_size=square_hd'
    },
    {
      id: '4',
      title: 'AI量化投资策略',
      description: '学习如何利用人工智能和量化方法制定投资策略',
      category: '量化投资',
      level: 'advanced',
      duration: '12小时',
      instructor: '陈博士',
      rating: 4.6,
      views: 4500,
      likes: 1200,
      content: '本课程将介绍如何利用人工智能和量化方法制定投资策略，包括数据获取与处理、策略设计与回测、风险控制与资金管理、实盘交易与监控等。通过本课程的学习，您将了解量化投资的基本原理和实践方法，能够运用AI技术辅助投资决策。',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20quantitative%20investment%20strategy%20course%20thumbnail%20with%20data%20visualization%20and%20AI%20elements&image_size=square_hd'
    }
  ]

  // 模拟文章数据
  const articles: Article[] = [
    {
      id: '1',
      title: '2024年A股市场展望：机遇与挑战',
      content: '2024年A股市场面临着诸多机遇与挑战。一方面，国内经济持续恢复，政策支持力度加大，科技创新不断推进，为市场提供了良好的发展环境；另一方面，全球经济不确定性增加，地缘政治风险存在，市场波动可能加大。投资者应保持理性，关注优质企业，制定合理的投资策略。',
      author: '市场分析员',
      publishDate: '2024-01-15',
      readTime: '8分钟',
      views: 5600,
      likes: 890,
      category: '市场分析',
      tags: ['A股', '市场展望', '2024']
    },
    {
      id: '2',
      title: '如何构建一个平衡的投资组合',
      content: '构建一个平衡的投资组合是投资成功的关键。投资者应根据自己的风险承受能力、投资目标和投资期限，合理配置不同资产类别，包括股票、债券、现金等。同时，定期调整投资组合，以适应市场变化和个人需求的变化。',
      author: '投资顾问',
      publishDate: '2024-01-10',
      readTime: '10分钟',
      views: 4300,
      likes: 670,
      category: '投资策略',
      tags: ['投资组合', '资产配置', '风险管理']
    },
    {
      id: '3',
      title: '技术分析常用指标详解',
      content: '技术分析是股票投资中常用的方法之一，通过分析历史价格和交易量数据，预测未来价格走势。常用的技术指标包括移动平均线、MACD、RSI、KDJ等。投资者应了解这些指标的原理和应用方法，结合其他分析方法，做出更准确的投资决策。',
      author: '技术分析师',
      publishDate: '2024-01-05',
      readTime: '12分钟',
      views: 3800,
      likes: 540,
      category: '技术分析',
      tags: ['技术指标', 'MACD', 'RSI', 'KDJ']
    }
  ]

  // 模拟视频数据
  const videos: Video[] = [
    {
      id: '1',
      title: '股票投资入门教程',
      description: '从零开始学习股票投资的基本概念和操作方法',
      duration: '30分钟',
      instructor: '张教授',
      publishDate: '2024-01-01',
      views: 12000,
      likes: 2800,
      category: '基础知识',
      thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stock%20investment%20beginner%20tutorial%20video%20thumbnail&image_size=square_hd'
    },
    {
      id: '2',
      title: '如何分析财务报表',
      description: '详细讲解如何阅读和分析公司财务报表',
      duration: '45分钟',
      instructor: '王分析师',
      publishDate: '2023-12-25',
      views: 8500,
      likes: 1900,
      category: '基本面分析',
      thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=financial%20statement%20analysis%20video%20thumbnail&image_size=square_hd'
    },
    {
      id: '3',
      title: 'AI在投资中的应用',
      description: '探讨人工智能技术在投资决策中的应用',
      duration: '40分钟',
      instructor: '陈博士',
      publishDate: '2023-12-20',
      views: 6700,
      likes: 1500,
      category: '量化投资',
      thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20in%20investment%20video%20thumbnail&image_size=square_hd'
    }
  ]

  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course)
    setShowCourseModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowCourseModal(false)
    setSelectedCourse(null)
  }, [])

  const handleLike = useCallback(() => {
    message.success('点赞成功！')
  }, [])

  const handleShare = useCallback(() => {
    message.success('分享成功！')
  }, [])

  const handleDownload = useCallback(() => {
    message.success('下载功能开发中')
  }, [])

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>
          <Space>
            <BookOutlined />
            <span>投资教育</span>
          </Space>
        </h2>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab} size="small">
        <Tabs.TabPane tab={<span><BookOutlined />课程</span>} key="courses">
          <Row gutter={[2, 2]}>
            {courses.map(course => (
              <Col key={course.id} xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  style={{ margin: '2px', height: '100%' }}
                  cover={<img alt={course.title} src={course.image} style={{ height: 150, objectFit: 'cover' }} />}
                  onClick={() => handleCourseClick(course)}
                >
                  <Card.Meta
                    title={
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{course.title}</div>
                        <Tag color={course.level === 'beginner' ? 'green' : course.level === 'intermediate' ? 'blue' : 'orange'}>
                          {course.level === 'beginner' ? '初级' : course.level === 'intermediate' ? '中级' : '高级'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        <div style={{ marginBottom: '4px' }}>{course.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                            <span>{course.instructor}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <StarOutlined style={{ fontSize: '12px', color: '#faad14', marginRight: '4px' }} />
                            <span>{course.rating}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px' }}>{course.views}次观看</span>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" icon={<LikeOutlined />} onClick={(e) => { e.stopPropagation(); handleLike(); }}>
                      {course.likes}
                    </Button>
                    <Button size="small" icon={<ShareAltOutlined />} onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                      分享
                    </Button>
                    <Button size="small" icon={<DownloadOutlined />} onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                      下载
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><FileTextOutlined />文章</span>} key="articles">
          <List
            itemLayout="vertical"
            dataSource={articles}
            renderItem={article => (
              <List.Item
                key={article.id}
                extra={
                  <div style={{ width: 120, textAlign: 'center' }}>
                    <Tag color="blue">{article.category}</Tag>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      <div style={{ marginBottom: '4px' }}>{article.readTime}</div>
                      <div>{article.publishDate}</div>
                    </div>
                  </div>
                }
              >
                <List.Item.Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{article.title}</span>
                      <Badge count={article.views} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: '8px' }}>{article.content}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {article.tags.map(tag => (
                            <Tag key={tag}>{tag}</Tag>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button size="small" icon={<LikeOutlined />} onClick={handleLike}>
                            {article.likes}
                          </Button>
                          <Button size="small" icon={<ShareAltOutlined />} onClick={handleShare}>
                            分享
                          </Button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><VideoCameraOutlined />视频</span>} key="videos">
          <Row gutter={[2, 2]}>
            {videos.map(video => (
              <Col key={video.id} xs={24} sm={12} md={6}>
                <Card 
                  hoverable 
                  style={{ margin: '2px', height: '100%' }}
                  cover={
                    <div style={{ position: 'relative' }}>
                      <img alt={video.title} src={video.thumbnail} style={{ height: 150, objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        {video.duration}
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>{video.title}</div>
                        <Tag color="blue">{video.category}</Tag>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        <div style={{ marginBottom: '4px' }}>{video.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                            <span>{video.instructor}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ fontSize: '12px', marginRight: '4px' }} />
                            <span>{video.publishDate}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px' }}>{video.views}次观看</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <LikeOutlined style={{ fontSize: '12px', color: '#ff4d4f', marginRight: '4px' }} />
                            <span>{video.likes}</span>
                          </div>
                        </div>
                      </div>
                    }
                  />
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <Button size="small" icon={<LikeOutlined />} onClick={handleLike}>
                      点赞
                    </Button>
                    <Button size="small" icon={<ShareAltOutlined />} onClick={handleShare}>
                      分享
                    </Button>
                    <Button size="small" type="primary">
                      观看
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={selectedCourse?.title}
        open={showCourseModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>关闭</Button>,
          <Button key="enroll" type="primary">开始学习</Button>
        ]}
        width={800}
      >
        {selectedCourse && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <img src={selectedCourse.image} alt={selectedCourse.title} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: '4px' }} />
            </div>
            <Divider>
              <Space>
                <Tag color={selectedCourse.level === 'beginner' ? 'green' : selectedCourse.level === 'intermediate' ? 'blue' : 'orange'}>
                  {selectedCourse.level === 'beginner' ? '初级' : selectedCourse.level === 'intermediate' ? '中级' : '高级'}
                </Tag>
                <Tag color="blue">{selectedCourse.category}</Tag>
                <Tag>{selectedCourse.duration}</Tag>
              </Space>
            </Divider>
            <div style={{ marginBottom: '16px' }}>
              <h3>课程简介</h3>
              <p>{selectedCourse.description}</p>
              <p>{selectedCourse.content}</p>
            </div>
            <Divider>
              <Space>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: '4px' }} />
                  <span>讲师: {selectedCourse.instructor}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StarOutlined style={{ color: '#faad14', marginRight: '4px' }} />
                  <span>评分: {selectedCourse.rating}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{selectedCourse.views}次观看</span>
                </div>
              </Space>
            </Divider>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default EducationalContent