// 클라우드 스토리지 시뮬레이션 클래스
class CloudStorage {
    constructor() {
        this.apiUrl = 'https://api.example.com'; // 실제 API URL로 변경 필요
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        
        // 온라인/오프라인 상태 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }
    
    // 사용자 데이터 저장
    async saveUserData(username, userData) {
        try {
            // 로컬에 먼저 저장
            localStorage.setItem(`user_${username}`, JSON.stringify(userData));
            
            if (this.isOnline) {
                // 클라우드에 저장
                await this.saveToCloud(username, userData);
            } else {
                // 오프라인일 때는 나중에 동기화할 목록에 추가
                this.addToPendingSync('save', username, userData);
            }
            
            return true;
        } catch (error) {
            console.error('사용자 데이터 저장 실패:', error);
            return false;
        }
    }
    
    // 사용자 데이터 로드
    async loadUserData(username) {
        try {
            // 먼저 로컬에서 확인
            const localData = localStorage.getItem(`user_${username}`);
            
            if (this.isOnline) {
                // 온라인일 때는 클라우드에서 최신 데이터 가져오기
                const cloudData = await this.loadFromCloud(username);
                if (cloudData) {
                    // 클라우드 데이터가 더 최신이면 로컬 업데이트
                    if (!localData || this.isNewerData(cloudData, JSON.parse(localData))) {
                        localStorage.setItem(`user_${username}`, JSON.stringify(cloudData));
                        return cloudData;
                    }
                }
            }
            
            // 로컬 데이터 반환
            return localData ? JSON.parse(localData) : null;
        } catch (error) {
            console.error('사용자 데이터 로드 실패:', error);
            // 오류 시 로컬 데이터 반환
            const localData = localStorage.getItem(`user_${username}`);
            return localData ? JSON.parse(localData) : null;
        }
    }
    
    // 리더보드 저장
    async saveLeaderboard(leaderboardData) {
        try {
            // 로컬에 저장
            localStorage.setItem('globalLeaderboard', JSON.stringify(leaderboardData));
            
            if (this.isOnline) {
                // 클라우드에 저장
                await this.saveLeaderboardToCloud(leaderboardData);
            } else {
                this.addToPendingSync('leaderboard', null, leaderboardData);
            }
            
            return true;
        } catch (error) {
            console.error('리더보드 저장 실패:', error);
            return false;
        }
    }
    
    // 리더보드 로드
    async loadLeaderboard() {
        try {
            const localData = localStorage.getItem('globalLeaderboard');
            
            if (this.isOnline) {
                const cloudData = await this.loadLeaderboardFromCloud();
                if (cloudData) {
                    // 클라우드 데이터가 더 최신이면 로컬 업데이트
                    if (!localData || this.isNewerLeaderboard(cloudData, JSON.parse(localData))) {
                        localStorage.setItem('globalLeaderboard', JSON.stringify(cloudData));
                        return cloudData;
                    }
                }
            }
            
            return localData ? JSON.parse(localData) : [];
        } catch (error) {
            console.error('리더보드 로드 실패:', error);
            const localData = localStorage.getItem('globalLeaderboard');
            return localData ? JSON.parse(localData) : [];
        }
    }
    
    // 클라우드 API 호출 (시뮬레이션)
    async saveToCloud(username, userData) {
        // 실제 구현에서는 fetch API를 사용하여 서버에 저장
        console.log('클라우드에 사용자 데이터 저장:', username);
        
        // 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 실제 구현 예시:
        /*
        const response = await fetch(`${this.apiUrl}/users/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('클라우드 저장 실패');
        }
        */
    }
    
    async loadFromCloud(username) {
        console.log('클라우드에서 사용자 데이터 로드:', username);
        
        // 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 실제 구현 예시:
        /*
        const response = await fetch(`${this.apiUrl}/users/${username}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
        */
        
        // 시뮬레이션: 로컬 데이터 반환
        const localData = localStorage.getItem(`user_${username}`);
        return localData ? JSON.parse(localData) : null;
    }
    
    async saveLeaderboardToCloud(leaderboardData) {
        console.log('클라우드에 리더보드 저장');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 실제 구현 예시:
        /*
        const response = await fetch(`${this.apiUrl}/leaderboard`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leaderboardData)
        });
        
        if (!response.ok) {
            throw new Error('리더보드 저장 실패');
        }
        */
    }
    
    async loadLeaderboardFromCloud() {
        console.log('클라우드에서 리더보드 로드');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 시뮬레이션: 로컬 데이터 반환
        const localData = localStorage.getItem('globalLeaderboard');
        return localData ? JSON.parse(localData) : [];
    }
    
    // 데이터 최신성 비교
    isNewerData(newData, oldData) {
        if (!oldData || !oldData.lastPlayed) return true;
        return new Date(newData.lastPlayed) > new Date(oldData.lastPlayed);
    }
    
    isNewerLeaderboard(newData, oldData) {
        if (!oldData || oldData.length === 0) return true;
        if (newData.length === 0) return false;
        
        // 가장 최근 점수 비교
        const newLatest = Math.max(...newData.map(score => new Date(score.date).getTime()));
        const oldLatest = Math.max(...oldData.map(score => new Date(score.date).getTime()));
        
        return newLatest > oldLatest;
    }
    
    // 대기 중인 동기화 작업 추가
    addToPendingSync(type, username, data) {
        this.pendingSync.push({
            type,
            username,
            data,
            timestamp: Date.now()
        });
        
        // 로컬에 대기 작업 저장
        localStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
    }
    
    // 대기 중인 데이터 동기화
    async syncPendingData() {
        if (!this.isOnline || this.pendingSync.length === 0) return;
        
        console.log('대기 중인 데이터 동기화 시작');
        
        const pendingData = [...this.pendingSync];
        this.pendingSync = [];
        
        for (const item of pendingData) {
            try {
                if (item.type === 'save') {
                    await this.saveToCloud(item.username, item.data);
                } else if (item.type === 'leaderboard') {
                    await this.saveLeaderboardToCloud(item.data);
                }
            } catch (error) {
                console.error('동기화 실패:', error);
                // 실패한 항목을 다시 대기 목록에 추가
                this.pendingSync.push(item);
            }
        }
        
        // 업데이트된 대기 목록 저장
        localStorage.setItem('pendingSync', JSON.stringify(this.pendingSync));
    }
    
    // 대기 중인 동기화 작업 로드
    loadPendingSync() {
        const pendingData = localStorage.getItem('pendingSync');
        if (pendingData) {
            this.pendingSync = JSON.parse(pendingData);
        }
    }
}

// 전역 인스턴스 생성
window.cloudStorage = new CloudStorage(); 