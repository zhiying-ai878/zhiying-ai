// 社交功能管理模块
class SocialManager {
    constructor() {
        Object.defineProperty(this, "posts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "comments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "users", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "followRelations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "currentUserId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'user1'
        });
        this.initializeMockData();
    }
    // 初始化模拟数据
    initializeMockData() {
        // 模拟用户数据
        this.users.set('user1', {
            userId: 'user1',
            username: '智能投资者',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
            bio: '专注价值投资，长期持有优质股票',
            followers: 128,
            following: 56,
            joinDate: Date.now() - 90 * 24 * 60 * 60 * 1000
        });
        this.users.set('user2', {
            userId: 'user2',
            username: '技术分析大师',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
            bio: '擅长技术分析，捕捉短线机会',
            followers: 256,
            following: 89,
            joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000
        });
        this.users.set('user3', {
            userId: 'user3',
            username: '价值投资倡导者',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
            bio: '坚持价值投资理念，寻找被低估的优质企业',
            followers: 189,
            following: 67,
            joinDate: Date.now() - 270 * 24 * 60 * 60 * 1000
        });
        // 模拟帖子数据
        this.posts = [
            {
                postId: 'post1',
                userId: 'user2',
                username: '技术分析大师',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
                content: '比亚迪(002594)突破前期阻力位，MACD金叉，有望迎来一波上涨行情。目标价280元。',
                stockCode: '002594',
                stockName: '比亚迪',
                price: 256.80,
                changePercent: 2.5,
                likes: 45,
                comments: 12,
                shares: 8,
                timestamp: Date.now() - 2 * 60 * 60 * 1000,
                isLiked: false,
                tags: ['技术分析', '比亚迪', 'MACD']
            },
            {
                postId: 'post2',
                userId: 'user3',
                username: '价值投资倡导者',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
                content: '贵州茅台(600519)作为白酒龙头，具有强大的品牌价值和护城河。虽然当前估值较高，但长期来看仍然值得持有。',
                stockCode: '600519',
                stockName: '贵州茅台',
                price: 1856.00,
                changePercent: 1.2,
                likes: 67,
                comments: 23,
                shares: 15,
                timestamp: Date.now() - 5 * 60 * 60 * 1000,
                isLiked: true,
                tags: ['价值投资', '贵州茅台', '长期持有']
            },
            {
                postId: 'post3',
                userId: 'user1',
                username: '智能投资者',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
                content: '市场分析：近期新能源板块表现强势，特别是宁德时代(300750)和比亚迪(002594)。建议关注相关产业链个股。',
                likes: 34,
                comments: 8,
                shares: 5,
                timestamp: Date.now() - 8 * 60 * 60 * 1000,
                isLiked: false,
                tags: ['市场分析', '新能源', '产业链']
            }
        ];
        // 模拟评论数据
        this.comments = [
            {
                commentId: 'comment1',
                postId: 'post1',
                userId: 'user1',
                username: '智能投资者',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
                content: '分析得很有道理，我也看好比亚迪的走势。',
                timestamp: Date.now() - 1.5 * 60 * 60 * 1000,
                likes: 5,
                isLiked: false
            },
            {
                commentId: 'comment2',
                postId: 'post2',
                userId: 'user2',
                username: '技术分析大师',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
                content: '从技术面看，茅台确实有调整的需求，建议暂时观望。',
                timestamp: Date.now() - 4 * 60 * 60 * 1000,
                likes: 8,
                isLiked: true
            }
        ];
        // 模拟关注关系
        this.followRelations = [
            { followerId: 'user1', followingId: 'user2', timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
            { followerId: 'user1', followingId: 'user3', timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000 },
            { followerId: 'user2', followingId: 'user3', timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000 }
        ];
    }
    // 获取当前用户信息
    getCurrentUser() {
        return this.users.get(this.currentUserId) || null;
    }
    // 获取用户信息
    getUserInfo(userId) {
        return this.users.get(userId) || null;
    }
    // 获取帖子列表
    getPosts(page = 1, pageSize = 10) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return this.posts.slice(start, end);
    }
    // 获取帖子详情
    getPostDetail(postId) {
        return this.posts.find(post => post.postId === postId) || null;
    }
    // 获取帖子评论
    getPostComments(postId, page = 1, pageSize = 20) {
        const postComments = this.comments.filter(comment => comment.postId === postId);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return postComments.slice(start, end);
    }
    // 发布帖子
    createPost(content, stockCode, stockName, price, changePercent, images) {
        const newPost = {
            postId: `post${Date.now()}`,
            userId: this.currentUserId,
            username: this.users.get(this.currentUserId)?.username || '未知用户',
            avatar: this.users.get(this.currentUserId)?.avatar || '',
            content,
            stockCode,
            stockName,
            price,
            changePercent,
            images,
            likes: 0,
            comments: 0,
            shares: 0,
            timestamp: Date.now(),
            isLiked: false
        };
        this.posts.unshift(newPost);
        return newPost;
    }
    // 发布评论
    createComment(postId, content, replyTo, replyToUsername) {
        const newComment = {
            commentId: `comment${Date.now()}`,
            postId,
            userId: this.currentUserId,
            username: this.users.get(this.currentUserId)?.username || '未知用户',
            avatar: this.users.get(this.currentUserId)?.avatar || '',
            content,
            timestamp: Date.now(),
            likes: 0,
            isLiked: false,
            replyTo,
            replyToUsername
        };
        this.comments.push(newComment);
        // 更新帖子评论数
        const post = this.posts.find(p => p.postId === postId);
        if (post) {
            post.comments++;
        }
        return newComment;
    }
    // 点赞帖子
    likePost(postId) {
        const post = this.posts.find(p => p.postId === postId);
        if (post) {
            if (post.isLiked) {
                post.likes--;
                post.isLiked = false;
            }
            else {
                post.likes++;
                post.isLiked = true;
            }
            return true;
        }
        return false;
    }
    // 点赞评论
    likeComment(commentId) {
        const comment = this.comments.find(c => c.commentId === commentId);
        if (comment) {
            if (comment.isLiked) {
                comment.likes--;
                comment.isLiked = false;
            }
            else {
                comment.likes++;
                comment.isLiked = true;
            }
            return true;
        }
        return false;
    }
    // 分享帖子
    sharePost(postId) {
        const post = this.posts.find(p => p.postId === postId);
        if (post) {
            post.shares++;
            return true;
        }
        return false;
    }
    // 关注用户
    followUser(userId) {
        if (userId === this.currentUserId) {
            return false;
        }
        const existingRelation = this.followRelations.find(relation => relation.followerId === this.currentUserId && relation.followingId === userId);
        if (!existingRelation) {
            this.followRelations.push({
                followerId: this.currentUserId,
                followingId: userId,
                timestamp: Date.now()
            });
            // 更新用户关注数
            const currentUser = this.users.get(this.currentUserId);
            if (currentUser) {
                currentUser.following++;
            }
            const targetUser = this.users.get(userId);
            if (targetUser) {
                targetUser.followers++;
            }
            return true;
        }
        return false;
    }
    // 取消关注用户
    unfollowUser(userId) {
        const index = this.followRelations.findIndex(relation => relation.followerId === this.currentUserId && relation.followingId === userId);
        if (index !== -1) {
            this.followRelations.splice(index, 1);
            // 更新用户关注数
            const currentUser = this.users.get(this.currentUserId);
            if (currentUser && currentUser.following > 0) {
                currentUser.following--;
            }
            const targetUser = this.users.get(userId);
            if (targetUser && targetUser.followers > 0) {
                targetUser.followers--;
            }
            return true;
        }
        return false;
    }
    // 检查是否关注了用户
    isFollowing(userId) {
        return this.followRelations.some(relation => relation.followerId === this.currentUserId && relation.followingId === userId);
    }
    // 获取关注列表
    getFollowing(page = 1, pageSize = 20) {
        const followingIds = this.followRelations
            .filter(relation => relation.followerId === this.currentUserId)
            .map(relation => relation.followingId);
        const followingUsers = followingIds
            .map(id => this.users.get(id))
            .filter((user) => user !== undefined);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return followingUsers.slice(start, end);
    }
    // 获取粉丝列表
    getFollowers(page = 1, pageSize = 20) {
        const followerIds = this.followRelations
            .filter(relation => relation.followingId === this.currentUserId)
            .map(relation => relation.followerId);
        const followerUsers = followerIds
            .map(id => this.users.get(id))
            .filter((user) => user !== undefined);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return followerUsers.slice(start, end);
    }
    // 搜索用户
    searchUsers(keyword) {
        const users = Array.from(this.users.values());
        return users.filter(user => user.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.bio.toLowerCase().includes(keyword.toLowerCase()));
    }
    // 搜索帖子
    searchPosts(keyword) {
        return this.posts.filter(post => post.content.toLowerCase().includes(keyword.toLowerCase()) ||
            (post.stockName && post.stockName.toLowerCase().includes(keyword.toLowerCase())) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))));
    }
    // 获取热门帖子
    getHotPosts(limit = 10) {
        return [...this.posts]
            .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
            .slice(0, limit);
    }
    // 获取用户帖子
    getUserPosts(userId, page = 1, pageSize = 10) {
        const userPosts = this.posts.filter(post => post.userId === userId);
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return userPosts.slice(start, end);
    }
    // 更新用户资料
    updateUserProfile(bio) {
        const user = this.users.get(this.currentUserId);
        if (user) {
            user.bio = bio;
            return true;
        }
        return false;
    }
}
// 导出单例实例
let socialManager = null;
export const getSocialManager = () => {
    if (!socialManager) {
        socialManager = new SocialManager();
    }
    return socialManager;
};
