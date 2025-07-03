class ShootingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 게임 상태
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 5;
        this.level = 1;
        
        // 사용자 정보
        this.currentUser = '게스트';
        this.isLoggedIn = false;
        this.highScore = 0;
        
        // 플레이어
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 120,
            height: 70,
            speed: 8, // 플레이어 이동 속도를 8로 조정 (더 부드러운 이동)
            color: '#00ffff',
            invincible: false,  // 무적 상태
            invincibleTime: 0,   // 무적 시간
            respawning: false,   // 리스폰 중
            respawnTime: 0       // 리스폰 시간
        };
        
        // 게임 객체들
        this.bullets = [];
        this.enemies = [];
        this.obstacles = [];
        this.items = [];
        this.particles = [];
        this.stars = [];
        
        // 입력 처리
        this.keys = {};
        this.lastShot = 0;
        this.shotCooldown = 100;
        this.bulletType = 'normal';
        this.bulletPower = 1;
        this.bulletLevel = 1;
        
        // 사운드 시스템
        this.soundEnabled = false;
        
        // 레벨 시스템 (난이도 증가)
        this.enemySpawnRate = 120;
        this.enemySpawnCounter = 0;
        this.obstacleSpawnRate = 180;
        this.obstacleSpawnCounter = 0;
        this.itemSpawnRate = 300;
        this.itemSpawnCounter = 0;
        
        // 난이도 증가 변수
        this.enemySpeed = 2;
        this.enemyHealth = 1;
        this.enemyDamage = 1;
        
        this.init();
    }
    
    init() {
        this.initLoginSystem();
        this.initLeaderboard();
        this.setupEventListeners();
        this.resizeCanvas();
        this.createBackground();
        this.initSounds();
        this.gameLoop();
        
        // 윈도우 리사이즈 이벤트 리스너 추가
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    initLoginSystem() {
        document.getElementById('loginBtn').addEventListener('click', () => this.login());
        document.getElementById('guestBtn').addEventListener('click', () => this.loginAsGuest());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        this.loadUserData();
    }
    
    resizeCanvas() {
        const canvas = document.getElementById('gameCanvas');
        const container = canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // 컨테이너 크기에 맞춰 캔버스 크기 조정
        const maxWidth = Math.min(600, containerRect.width - 40); // 패딩 고려
        const maxHeight = Math.min(600, window.innerHeight * 0.75); // 화면 높이의 75%
        
        // 비율 유지하면서 크기 조정
        const aspectRatio = 1; // 정사각형 캔버스
        let newWidth = maxWidth;
        let newHeight = maxWidth;
        
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = maxHeight;
        }
        
        // 캔버스 크기 설정
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 게임 내부 크기도 업데이트
        this.width = newWidth;
        this.height = newHeight;
        
        // 플레이어 위치 재조정
        if (this.player) {
            this.player.x = this.width / 2 - this.player.width / 2;
            this.player.y = this.height - 50;
        }
    }
    
    initLeaderboard() {
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('closeLeaderboard').addEventListener('click', () => this.hideLeaderboard());
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e.target.dataset.tab));
        });
        document.getElementById('leaderboardModal').addEventListener('click', (e) => {
            if (e.target.id === 'leaderboardModal') this.hideLeaderboard();
        });
    }
    
    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (username.length < 2) {
            alert('사용자명은 2글자 이상 입력해주세요.');
            return;
        }
        
        if (password.length < 1) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        // 클라우드에서 사용자 데이터 확인
        if (window.cloudStorage) {
            try {
                const existingUserData = await window.cloudStorage.loadUserData(username);
                if (existingUserData) {
                    if (existingUserData.password !== password) {
                        alert('비밀번호가 일치하지 않습니다.');
                        return;
                    }
                    // 기존 사용자 로그인 - 데이터 복원
                    this.currentUser = username;
                    this.isLoggedIn = true;
                    this.highScore = existingUserData.highScore || 0;
                    this.showGameScreen();
                } else {
                    // 새 사용자 등록
                    this.currentUser = username;
                    this.isLoggedIn = true;
                    this.highScore = 0;
                    
                    // 새 사용자 데이터 저장
                    const newUserData = {
                        username: username,
                        password: password,
                        highScore: 0,
                        lastPlayed: new Date().toISOString()
                    };
                    await window.cloudStorage.saveUserData(username, newUserData);
                    
                    this.showGameScreen();
                }
            } catch (error) {
                console.error('클라우드 로그인 실패:', error);
                // 폴백: 로컬 스토리지 사용
                this.loginWithLocalStorage(username, password);
            }
        } else {
            // 클라우드 스토리지가 없으면 로컬 스토리지 사용
            this.loginWithLocalStorage(username, password);
        }
    }
    
    loginWithLocalStorage(username, password) {
        const existingUserData = localStorage.getItem(`user_${username}`);
        if (existingUserData) {
            const userData = JSON.parse(existingUserData);
            if (userData.password !== password) {
                alert('비밀번호가 일치하지 않습니다.');
                return;
            }
            // 기존 사용자 로그인 - 데이터 복원
            this.currentUser = username;
            this.isLoggedIn = true;
            this.highScore = userData.highScore || 0;
            this.showGameScreen();
        } else {
            // 새 사용자 등록
            this.currentUser = username;
            this.isLoggedIn = true;
            this.highScore = 0;
            
            // 새 사용자 데이터 저장
            const newUserData = {
                username: username,
                password: password,
                highScore: 0,
                lastPlayed: new Date().toISOString()
            };
            localStorage.setItem(`user_${username}`, JSON.stringify(newUserData));
            
            this.showGameScreen();
        }
    }
    
    loginAsGuest() {
        this.currentUser = '게스트_' + Math.floor(Math.random() * 1000);
        this.isLoggedIn = false;
        this.showGameScreen();
    }
    
    logout() {
        this.currentUser = '게스트';
        this.isLoggedIn = false;
        this.highScore = 0;
        this.showLoginScreen();
    }
    
    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
    }
    
    showGameScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('currentUser').textContent = this.currentUser;
        
        // 로그인 필드 초기화
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // 게임 화면이 표시된 후 캔버스 크기 조정
        setTimeout(() => {
            this.resizeCanvas();
        }, 100);
    }
    
    async loadUserData() {
        if (this.isLoggedIn && window.cloudStorage) {
            try {
                const userData = await window.cloudStorage.loadUserData(this.currentUser);
                if (userData) {
                    this.highScore = userData.highScore || 0;
                }
            } catch (error) {
                console.error('사용자 데이터 로드 실패:', error);
                // 폴백: 로컬 스토리지 사용
                const savedData = localStorage.getItem(`user_${this.currentUser}`);
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.highScore = data.highScore || 0;
                }
            }
        }
    }
    
    async saveUserData() {
        if (this.isLoggedIn && this.score > this.highScore) {
            this.highScore = this.score;
            
            // 기존 사용자 데이터 가져오기 (비밀번호 유지)
            const existingData = localStorage.getItem(`user_${this.currentUser}`);
            let userData;
            if (existingData) {
                userData = JSON.parse(existingData);
                userData.highScore = this.highScore;
                userData.lastPlayed = new Date().toISOString();
            } else {
                userData = {
                    username: this.currentUser,
                    highScore: this.highScore,
                    lastPlayed: new Date().toISOString()
                };
            }
            
            // 클라우드 스토리지에 저장
            if (window.cloudStorage) {
                try {
                    await window.cloudStorage.saveUserData(this.currentUser, userData);
                } catch (error) {
                    console.error('클라우드 저장 실패:', error);
                    // 폴백: 로컬 스토리지 사용
                    localStorage.setItem(`user_${this.currentUser}`, JSON.stringify(userData));
                }
            } else {
                localStorage.setItem(`user_${this.currentUser}`, JSON.stringify(userData));
            }
            
            this.saveToLeaderboard();
        }
    }
    
    async saveToLeaderboard() {
        const leaderboard = await this.getLeaderboard();
        const newScore = {
            username: this.currentUser,
            score: this.score,
            level: this.level,
            date: new Date().toISOString()
        };
        leaderboard.push(newScore);
        leaderboard.sort((a, b) => b.score - a.score);
        if (leaderboard.length > 100) leaderboard.splice(100);
        
        // 클라우드 스토리지에 저장
        if (window.cloudStorage) {
            try {
                await window.cloudStorage.saveLeaderboard(leaderboard);
            } catch (error) {
                console.error('클라우드 리더보드 저장 실패:', error);
                // 폴백: 로컬 스토리지 사용
                localStorage.setItem('globalLeaderboard', JSON.stringify(leaderboard));
            }
        } else {
            localStorage.setItem('globalLeaderboard', JSON.stringify(leaderboard));
        }
    }
    
    async getLeaderboard() {
        if (window.cloudStorage) {
            try {
                return await window.cloudStorage.loadLeaderboard();
            } catch (error) {
                console.error('클라우드 리더보드 로드 실패:', error);
                // 폴백: 로컬 스토리지 사용
                const saved = localStorage.getItem('globalLeaderboard');
                return saved ? JSON.parse(saved) : [];
            }
        } else {
            const saved = localStorage.getItem('globalLeaderboard');
            return saved ? JSON.parse(saved) : [];
        }
    }
    
    getUserScores() {
        if (!this.isLoggedIn) return [];
        const leaderboard = this.getLeaderboard();
        return leaderboard.filter(score => score.username === this.currentUser);
    }
    
    showLeaderboard() {
        document.getElementById('leaderboardModal').style.display = 'flex';
        this.updateLeaderboard();
    }
    
    hideLeaderboard() {
        document.getElementById('leaderboardModal').style.display = 'none';
    }
    
    switchLeaderboardTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab}Leaderboard`).classList.add('active');
        this.updateLeaderboard();
    }
    
    async updateLeaderboard() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        if (activeTab === 'global') {
            await this.updateGlobalLeaderboard();
        } else {
            await this.updatePersonalLeaderboard();
        }
    }
    
    async updateGlobalLeaderboard() {
        const leaderboard = await this.getLeaderboard();
        const container = document.querySelector('#globalLeaderboard .leaderboard-list');
        container.innerHTML = '';
        leaderboard.slice(0, 20).forEach((score, index) => {
            const item = this.createLeaderboardItem(score, index + 1, score.username === this.currentUser);
            container.appendChild(item);
        });
    }
    
    async updatePersonalLeaderboard() {
        const userScores = this.getUserScores();
        const container = document.querySelector('#personalLeaderboard .leaderboard-list');
        container.innerHTML = '';
        if (userScores.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">아직 기록이 없습니다.</p>';
            return;
        }
        userScores.slice(0, 10).forEach((score, index) => {
            const item = this.createLeaderboardItem(score, index + 1, true);
            container.appendChild(item);
        });
    }
    
    createLeaderboardItem(score, rank, isCurrentUser) {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${isCurrentUser ? 'current-user' : ''}`;
        const rankClass = rank <= 3 ? ['gold', 'silver', 'bronze'][rank - 1] : '';
        item.innerHTML = `
            <div class="rank ${rankClass}">${rank}</div>
            <div class="user-info-leaderboard">
                <div class="username">${score.username}</div>
                <div class="score-info">레벨 ${score.level} • ${new Date(score.date).toLocaleDateString()}</div>
            </div>
            <div class="score-value">${score.score.toLocaleString()}</div>
        `;
        return item;
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            // 게임이 실행 중일 때만 키 입력 처리
            if (this.gameRunning && !this.gamePaused) {
                this.keys[e.code] = true;
                if (e.code === 'Space') {
                    e.preventDefault();
                    this.shoot();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            // 게임이 실행 중일 때만 키 입력 처리
            if (this.gameRunning) {
                this.keys[e.code] = false;
            }
        });
        
        // 터치 이벤트
        let touchStartX = 0;
        let touchStartY = 0;
        let isTouching = false;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            // 게임이 실행 중이고 일시정지 상태가 아닐 때만 터치 처리
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            touchStartX = touch.clientX - rect.left;
            touchStartY = touch.clientY - rect.top;
            isTouching = true;
            this.shoot();
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            // 게임이 실행 중이고 일시정지 상태가 아니며 터치 중일 때만 처리
            if (!this.gameRunning || this.gamePaused || !isTouching) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const targetX = touchX - this.player.width / 2;
            this.player.x = Math.max(0, Math.min(this.width - this.player.width, targetX));
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isTouching = false;
        });
        
        // 버튼 이벤트
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startGame());
        if (this.pauseBtn) this.pauseBtn.addEventListener('click', () => this.togglePause());
        if (this.restartBtn) this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 모바일 조작 버튼
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const fireBtn = document.getElementById('fireBtn');
        
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = true; });
        leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowLeft'] = false; });
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys['ArrowRight'] = true; });
        rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.keys['ArrowRight'] = false; });
        fireBtn.addEventListener('touchstart', (e) => { e.preventDefault(); if (this.gameRunning && !this.gamePaused) this.shoot(); });
        
        leftBtn.addEventListener('mousedown', () => this.keys['ArrowLeft'] = true);
        leftBtn.addEventListener('mouseup', () => this.keys['ArrowLeft'] = false);
        rightBtn.addEventListener('mousedown', () => this.keys['ArrowRight'] = true);
        rightBtn.addEventListener('mouseup', () => this.keys['ArrowRight'] = false);
        fireBtn.addEventListener('mousedown', () => { if (this.gameRunning && !this.gamePaused) this.shoot(); });
    }
    
    startGame() {
        console.log('게임 시작!');
        
        // 오디오 컨텍스트 활성화 (브라우저 자동 재생 정책 대응)
        if (this.audioGenerator && this.audioGenerator.audioContext.state === 'suspended') {
            this.audioGenerator.audioContext.resume();
        }
        
        // 게임 상태 초기화
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.lives = Math.floor(5); // 정수로 초기화
        this.level = 1;
        
        console.log(`초기 생명: ${this.lives}`);
        
        // 난이도 초기화
        this.enemySpeed = 2; // 초기 속도를 적절하게 조정
        this.enemyHealth = 1;
        this.enemyDamage = 1;
        this.enemySpawnRate = 120; // 적기 생성 빈도를 적절하게 조정
        this.obstacleSpawnRate = 180; // 장애물 생성 빈도를 적절하게 조정
        this.itemSpawnRate = 120; // 아이템 생성 빈도를 더 자주로 조정
        
        // 게임 객체들 완전 초기화
        this.bullets = [];
        this.enemies = [];
        this.obstacles = [];
        this.items = [];
        this.particles = [];
        
        // 총알 시스템 완전 초기화
        console.log('게임 시작 전 아이템 상태:', {
            bulletType: this.bulletType,
            bulletPower: this.bulletPower,
            bulletLevel: this.bulletLevel,
            shotCooldown: this.shotCooldown
        });
        
        this.bulletType = 'normal';
        this.bulletPower = 1;
        this.bulletLevel = 1;
        this.shotCooldown = 100;
        
        console.log('게임 시작 후 아이템 상태:', {
            bulletType: this.bulletType,
            bulletPower: this.bulletPower,
            bulletLevel: this.bulletLevel,
            shotCooldown: this.shotCooldown
        });
        
        // 무적 상태 초기화
        this.player.invincible = false;
        this.player.invincibleTime = 0;
        
        // 리스폰 상태 초기화
        this.player.respawning = false;
        this.player.respawnTime = 0;
        
        // UI 업데이트
        if (this.startBtn) this.startBtn.style.display = 'none';
        if (this.pauseBtn) this.pauseBtn.style.display = 'inline-block';
        
        const gameOverElement = document.getElementById('gameOver');
        if (gameOverElement) gameOverElement.style.display = 'none';
        
        this.updateUI();
    }
    
    togglePause() {
        if (this.gameRunning && this.pauseBtn) {
            this.gamePaused = !this.gamePaused;
            this.pauseBtn.textContent = this.gamePaused ? '계속하기' : '일시정지';
        }
    }
    
    restartGame() {
        // 게임오버 화면 숨기기
        document.getElementById('gameOver').style.display = 'none';
        
        // 게임 상태 완전 초기화
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 잠시 후 새 게임 시작 (상태 초기화를 위한 지연)
        setTimeout(() => {
            this.startGame();
        }, 100);
    }
    
    resetLives() {
        console.log('생명 리셋 시작');
        
        // 게임 일시 중지
        this.gameRunning = false;
        
        // 생명 리셋 (2초 후)
        setTimeout(() => {
            console.log('생명 리셋 완료 - 새로운 생명 5개');
            this.lives = 5;
            this.gameRunning = true;
            
            // 플레이어 위치 리셋
            this.player.x = this.width / 2;
            this.player.y = this.height - 50;
            
            // 무적 상태 해제
            this.player.invincible = false;
            this.player.invincibleTime = 0;
            this.player.respawning = false;
            this.player.respawnTime = 0;
            
            // UI 업데이트
            this.updateUI();
        }, 2000); // 2초 대기
    }
    
    async gameOver() {
        // 게임오버 중복 호출 방지 (gameRunning이 false여도 실행)
        console.log('게임오버 함수 호출됨');
        
        console.log('게임오버 실행 - 생명:', this.lives, '점수:', this.score);
        
        // 게임 상태 완전 중지 (이미 false일 수 있음)
        this.gameRunning = false;
        this.gamePaused = false;
        
        // 생명을 확실히 0으로 설정
        this.lives = 0;
        console.log('게임오버 시 최종 생명:', this.lives);
        
        // 점수 저장
        await this.saveUserData();
        
        // DOM 요소들이 존재하는지 확인
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const highScoreElement = document.getElementById('highScore');
        
        if (gameOverElement && finalScoreElement && highScoreElement) {
            // 게임오버 화면 표시
            finalScoreElement.textContent = this.score.toLocaleString();
            highScoreElement.textContent = this.highScore.toLocaleString();
            gameOverElement.style.display = 'block';
        } else {
            console.error('게임오버 화면 요소를 찾을 수 없습니다:', {
                gameOver: !!gameOverElement,
                finalScore: !!finalScoreElement,
                highScore: !!highScoreElement
            });
        }
        
        // 버튼 상태 변경
        if (this.startBtn) this.startBtn.style.display = 'inline-block';
        if (this.pauseBtn) this.pauseBtn.style.display = 'none';
        
        // 게임오버 사운드
        this.playSound('gameOver');
        
        // 게임 오버 시 아이템 상태 초기화 (기본 총알로 리셋)
        this.bulletType = 'normal';
        this.bulletPower = 1;
        this.bulletLevel = 1;
        this.shotCooldown = 100;
        
        // UI 업데이트
        this.updateUI();
        
        console.log('게임오버 완료 - 게임 상태:', this.gameRunning);
    }
    
    levelUp() {
        // 레벨업 중복 호출 방지
        if (this.gamePaused) {
            console.log('레벨업 중복 호출 방지 - 이미 일시중지 상태');
            return;
        }
        
        console.log('레벨업 시작 - 이전 레벨:', this.level);
        this.level++;
        console.log('레벨업 완료 - 새로운 레벨:', this.level);
        this.playSound('levelUp');
        
        // UI 즉시 업데이트 (레벨 표시)
        this.updateUI();
        
        // 레벨업 화면 표시
        this.showLevelUpScreen();
        
        // 게임 일시 중지
        this.gamePaused = true;
        
        // 5초 후 레벨업 완료 (더 짧게)
        setTimeout(() => {
            this.hideLevelUpScreen();
            this.gamePaused = false;
            
            // 레벨별 특별한 변화 적용
            this.applyLevelChanges();
            
            // 기본 난이도 증가 (더 완만하게)
            this.enemySpeed += 0.1; // 0.2에서 0.1로 감소
            this.enemyHealth += 0.3; // 0.5에서 0.3으로 감소
            this.enemyDamage += 0.05; // 0.1에서 0.05로 감소
            this.enemyDamage = Math.min(2.5, this.enemyDamage); // 최대 데미지 제한
            this.enemySpawnRate = Math.max(40, this.enemySpawnRate - 5); // 스폰 속도 증가 완화
            this.obstacleSpawnRate = Math.max(80, this.obstacleSpawnRate - 10); // 장애물 스폰 완화
            this.itemSpawnRate = Math.max(100, this.itemSpawnRate - 5); // 아이템 스폰 완화
            
            // 플레이어 총알 데미지도 증가 (더 완만하게)
            this.bulletPower += 0.2; // 0.3에서 0.2로 감소
            
            this.createParticles(this.width / 2, this.height / 2, '#00ffff');
        }, 5000);
    }
    
    showLevelUpScreen() {
        document.getElementById('nextLevel').textContent = this.level;
        document.getElementById('levelUp').style.display = 'block';
    }
    
    hideLevelUpScreen() {
        document.getElementById('levelUp').style.display = 'none';
    }
    
    applyLevelChanges() {
        console.log(`레벨 ${this.level} 특별 변화 적용`);
        
        switch (this.level) {
            case 2:
                // 레벨 2: 빠른 적기 등장
                console.log('레벨 2: 빠른 적기 등장!');
                break;
                
            case 3:
                // 레벨 3: 탱크 적기 등장
                console.log('레벨 3: 탱크 적기 등장!');
                break;
                
            case 4:
                // 레벨 4: 보스 적기 등장
                console.log('레벨 4: 보스 적기 등장!');
                break;
                
            case 5:
                // 레벨 5: 더 빠른 스폰
                console.log('레벨 5: 적기 스폰 속도 증가!');
                this.enemySpawnRate = Math.max(20, this.enemySpawnRate - 20);
                break;
                
            case 6:
                // 레벨 6: 더 강한 적기
                console.log('레벨 6: 적기 체력 대폭 증가!');
                this.enemyHealth += 1;
                break;
                
            case 7:
                // 레벨 7: 더 많은 장애물
                console.log('레벨 7: 장애물 증가!');
                this.obstacleSpawnRate = Math.max(40, this.obstacleSpawnRate - 20);
                break;
                
            case 8:
                // 레벨 8: 보스 등장 확률 증가
                console.log('레벨 8: 보스 등장 확률 증가!');
                break;
                
            case 9:
                // 레벨 9: 최종 난이도
                console.log('레벨 9: 최종 난이도!');
                this.enemySpeed += 0.5;
                this.enemyHealth += 1;
                break;
                
            case 10:
                // 레벨 10: 악마 난이도
                console.log('레벨 10: 악마 난이도!');
                this.enemySpeed += 1;
                this.enemyHealth += 2;
                this.enemySpawnRate = Math.max(15, this.enemySpawnRate - 10);
                break;
                
            default:
                if (this.level > 10) {
                    // 레벨 10 이후: 지속적인 난이도 증가
                    console.log(`레벨 ${this.level}: 지속적인 난이도 증가!`);
                    this.enemySpeed += 0.3;
                    this.enemyHealth += 0.5;
                    this.enemySpawnRate = Math.max(10, this.enemySpawnRate - 5);
                }
                break;
        }
    }
    
    createLevelAnnouncement(message) {
        // 레벨별 공지사항을 화면에 표시
        const announcement = document.createElement('div');
        announcement.className = 'level-announcement';
        announcement.textContent = message;
        announcement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 15px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 2000;
            animation: announcementFade 3s ease-in-out forwards;
        `;
        
        // CSS 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes announcementFade {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(announcement);
        
        // 3초 후 제거
        setTimeout(() => {
            if (announcement.parentNode) {
                announcement.parentNode.removeChild(announcement);
            }
        }, 3000);
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;
        
        this.lastShot = now;
        
        switch (this.bulletType) {
            case 'normal':
                this.createBullet('normal');
                break;
            case 'rapid':
                this.createBullet('rapid');
                break;
            case 'spread':
                this.createBullet('spread');
                break;
            case 'laser':
                this.createBullet('laser');
                break;
            case 'bomb':
                this.createBullet('bomb');
                break;
        }
        
        this.playSound('shoot');
    }
    
    createBullet(type) {
        const bulletWidth = 8;
        const bulletHeight = 20;
        
        switch (type) {
            case 'normal':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - bulletWidth / 2,
                    y: this.player.y,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: 15, // 총알 속도를 8에서 15로 증가
                    damage: this.bulletPower,
                    type: 'normal',
                    color: '#00ffff'
                });
                break;
                
            case 'rapid':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - bulletWidth / 2,
                    y: this.player.y,
                    width: bulletWidth,
                    height: bulletHeight,
                    speed: 18, // 총알 속도를 10에서 18로 증가
                    damage: this.bulletPower,
                    type: 'rapid',
                    color: '#ff00ff'
                });
                break;
                
            case 'spread':
                // 스프레드 레벨에 따라 발사 수 결정 (최대 5발)
                const spreadCount = Math.min(5, this.bulletLevel + 2);
                const spreadAngle = 0.4; // 스프레드 각도
                
                for (let i = 0; i < spreadCount; i++) {
                    const angle = (i - (spreadCount - 1) / 2) * spreadAngle;
                    this.bullets.push({
                        x: this.player.x + this.player.width / 2 - bulletWidth / 2,
                        y: this.player.y,
                        width: bulletWidth,
                        height: bulletHeight,
                        speed: 12,
                        damage: this.bulletPower,
                        type: 'spread',
                        color: '#00ff00',
                        angle: angle
                    });
                }
                break;
                
            case 'laser':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - bulletWidth / 2,
                    y: this.player.y,
                    width: bulletWidth * 2,
                    height: bulletHeight * 3,
                    speed: 10, // 총알 속도를 6에서 10으로 증가
                    damage: this.bulletPower * 2,
                    type: 'laser',
                    color: '#ff0000'
                });
                break;
                
            case 'bomb':
                this.bullets.push({
                    x: this.player.x + this.player.width / 2 - bulletWidth / 2,
                    y: this.player.y,
                    width: bulletWidth * 1.5,
                    height: bulletHeight * 1.5,
                    speed: 8, // 총알 속도를 5에서 8로 증가
                    damage: this.bulletPower * 3,
                    type: 'bomb',
                    color: '#ffff00'
                });
                break;
        }
    }
    
    createEnemy() {
        const enemyWidth = 120;
        const enemyHeight = 70;
        
        // 적기 타입 결정 (레벨에 따라 다양화)
        let enemyType = 'basic';
        const typeChance = Math.random();
        
        // 레벨별 적기 등장 확률 조정 (누적 확률로 계산)
        if (this.level >= 7 && typeChance < 0.15) {
            enemyType = 'laser'; // 새로운 유형: 레이저 적기
        } else if (this.level >= 6 && typeChance < 0.35) {
            enemyType = 'kamikaze'; // 새로운 유형: 카미카제 적기
        } else if (this.level >= 5 && typeChance < 0.55) {
            enemyType = 'stealth'; // 새로운 유형: 스텔스 적기
        } else if (this.level >= 4 && typeChance < 0.7) {
            enemyType = 'boss';
        } else if (this.level >= 3 && typeChance < 0.9) {
            enemyType = 'tank';
        } else if (this.level >= 2 && typeChance < 1.0) {
            enemyType = 'fast';
        }
        
        // 레벨 8 이후 보스 등장 확률 증가 (별도 계산)
        if (this.level >= 8 && typeChance < 0.25) {
            enemyType = 'boss';
        }
        
        // 타입별 속성 설정
        let speed, health, damage, color, width, height;
        
        switch (enemyType) {
            case 'fast':
                speed = this.enemySpeed * 1.5 + Math.random() * 2;
                health = this.enemyHealth * 0.7;
                damage = this.enemyDamage * 0.8;
                color = '#ff8800';
                width = enemyWidth * 0.8;
                height = enemyHeight * 0.8;
                break;
            case 'tank':
                speed = this.enemySpeed * 0.6 + Math.random() * 1;
                health = this.enemyHealth * 2.5;
                damage = this.enemyDamage * 1.5;
                color = '#8800ff';
                width = enemyWidth * 1.3;
                height = enemyHeight * 1.3;
                break;
            case 'boss':
                speed = this.enemySpeed * 0.4 + Math.random() * 1;
                health = this.enemyHealth * 4;
                damage = this.enemyDamage * 2;
                color = '#ff0000';
                width = enemyWidth * 1.8;
                height = enemyHeight * 1.8;
                break;
            case 'stealth':
                speed = this.enemySpeed * 2 + Math.random() * 3;
                health = this.enemyHealth * 0.5;
                damage = this.enemyDamage * 1.2;
                color = '#666666';
                width = enemyWidth * 0.6;
                height = enemyHeight * 0.6;
                break;
            case 'kamikaze':
                speed = this.enemySpeed * 2.5 + Math.random() * 2;
                health = this.enemyHealth * 0.3;
                damage = this.enemyDamage * 3;
                color = '#ff6600';
                width = enemyWidth * 0.7;
                height = enemyHeight * 0.7;
                break;
            case 'laser':
                speed = this.enemySpeed * 0.8 + Math.random() * 1;
                health = this.enemyHealth * 1.8;
                damage = this.enemyDamage * 1.8;
                color = '#00ffff';
                width = enemyWidth * 1.1;
                height = enemyHeight * 1.1;
                break;
            default: // basic
                speed = this.enemySpeed + Math.random() * 2;
                health = this.enemyHealth;
                damage = this.enemyDamage;
                color = '#ff4444';
                width = enemyWidth;
                height = enemyHeight;
                break;
        }
        
        this.enemies.push({
            x: Math.random() * (this.width - width),
            y: -height,
            width: width,
            height: height,
            speed: speed,
            health: health,
            damage: damage,
            color: color,
            type: enemyType
        });
        
        // 새로운 적기 타입 생성 시 로그
        if (enemyType !== 'basic' && enemyType !== 'fast' && enemyType !== 'tank') {
            console.log(`새로운 적기 생성: ${enemyType} (레벨: ${this.level})`);
        }
    }
    
    createObstacle() {
        const obstacleWidth = 60;
        const obstacleHeight = 60;
        
        this.obstacles.push({
            x: Math.random() * (this.width - obstacleWidth),
            y: -obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight,
            speed: 8 + Math.random() * 4, // 장애물 속도를 5~8에서 8~12로 증가
            color: '#888888'
        });
    }
    
    createItem() {
        const itemTypes = ['rapid', 'spread', 'laser', 'bomb', 'shield', 'life'];
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const itemWidth = 30;
        const itemHeight = 30;
        
        this.items.push({
            x: Math.random() * (this.width - itemWidth),
            y: -itemHeight,
            width: itemWidth,
            height: itemHeight,
            speed: 6, // 아이템 속도를 4에서 6으로 증가
            type: itemType,
            color: this.getItemColor(itemType)
        });
    }
    
    getItemColor(type) {
        switch (type) {
            case 'rapid': return '#ff00ff';
            case 'spread': return '#00ff00';
            case 'laser': return '#ff0000';
            case 'bomb': return '#ffff00';
            case 'shield': return '#00ffff';
            case 'life': return '#ff69b4';
            default: return '#ffffff';
        }
    }
    
    createStars() {
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1,
                brightness: Math.random()
            });
        }
    }
    
    createBackground() {
        this.createStars();
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color,
                size: Math.random() * 3 + 2
            });
        }
    }
    
    update() {
        try {
            // 게임이 실행되지 않거나 일시정지 상태면 업데이트 중단
            if (!this.gameRunning) {
                return;
            }
            if (this.gamePaused) {
                return;
            }
            
            // 플레이어 이동
            if (this.keys['ArrowLeft']) {
                this.player.x = Math.max(0, this.player.x - this.player.speed);
            }
            if (this.keys['ArrowRight']) {
                this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
            }
            
            // 총알 업데이트
            this.bullets.forEach((bullet, index) => {
                if (bullet.angle) {
                    bullet.x += Math.sin(bullet.angle) * bullet.speed;
                    bullet.y -= bullet.speed;
                } else {
                    bullet.y -= bullet.speed;
                }
                
                if (bullet.y + bullet.height < 0) {
                    this.bullets.splice(index, 1);
                }
            });
            
            // 적 업데이트
            this.enemies.forEach((enemy, index) => {
                enemy.y += enemy.speed;
                if (enemy.y > this.height) {
                    this.enemies.splice(index, 1);
                }
            });
            
            // 장애물 업데이트
            this.obstacles.forEach((obstacle, index) => {
                obstacle.y += obstacle.speed;
                if (obstacle.y > this.height) {
                    this.obstacles.splice(index, 1);
                }
            });
            
            // 아이템 업데이트
            this.items.forEach((item, index) => {
                item.y += item.speed;
                if (item.y > this.height) {
                    this.items.splice(index, 1);
                }
            });
            
            // 파티클 업데이트
            this.particles.forEach((particle, index) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                if (particle.life <= 0) {
                    this.particles.splice(index, 1);
                }
            });
            
            // 별 업데이트
            this.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > this.height) {
                    star.y = -10;
                    star.x = Math.random() * this.width;
                }
            });
            
            // 무적 시간 업데이트
            if (this.player.invincible) {
                this.player.invincibleTime--;
                if (this.player.invincibleTime <= 0) {
                    this.player.invincible = false;
                }
            }
            
            // 리스폰 시간 업데이트
            if (this.player.respawning) {
                this.player.respawnTime--;
                if (this.player.respawnTime <= 0) {
                    this.player.respawning = false;
                    // 리스폰 완료 - 플레이어를 처음 위치로 이동
                    this.player.x = this.width / 2;
                    this.player.y = this.height - 50;
                }
            }
            
            // 적 생성
            this.enemySpawnCounter++;
            if (this.enemySpawnCounter >= this.enemySpawnRate) {
                this.createEnemy();
                this.enemySpawnCounter = 0;
            }
            
            // 장애물 생성
            this.obstacleSpawnCounter++;
            if (this.obstacleSpawnCounter >= this.obstacleSpawnRate) {
                this.createObstacle();
                this.obstacleSpawnCounter = 0;
            }
            
            // 아이템 생성
            this.itemSpawnCounter++;
            if (this.itemSpawnCounter >= this.itemSpawnRate) {
                this.createItem();
                this.itemSpawnCounter = 0;
            }
            
            // 충돌 검사
            this.checkCollisions();
            
            // 생명이 0이 되면 즉시 업데이트 중단
            if (this.lives <= 0) {
                this.gameRunning = false; // 게임 상태도 중지
                return;
            }
            
            // 레벨업 체크 (3000점마다)
            const expectedLevel = Math.floor(this.score / 3000) + 1;
            console.log('레벨업 체크 - 점수:', this.score, '현재 레벨:', this.level, '예상 레벨:', expectedLevel, '게임 일시중지:', this.gamePaused);
            
            if (this.score >= 3000 && expectedLevel > this.level && !this.gamePaused) {
                console.log('레벨업 조건 확인 - 점수:', this.score, '현재 레벨:', this.level, '예상 레벨:', expectedLevel);
                this.levelUp();
            }
            
            // UI 업데이트
            this.updateUI();
        } catch (error) {
            console.error('게임 업데이트 오류:', error);
        }
    }
    
    checkCollisions() {
        // 게임이 실행되지 않으면 충돌 검사 중단
        if (!this.gameRunning) return;
        
        // 제거할 객체들의 인덱스를 저장할 배열들
        const enemiesToRemove = [];
        const obstaclesToRemove = [];
        const bulletsToRemove = [];
        const itemsToRemove = [];
        
        // 중복 제거를 위한 Set 사용
        const enemiesToRemoveSet = new Set();
        const obstaclesToRemoveSet = new Set();
        const bulletsToRemoveSet = new Set();
        const itemsToRemoveSet = new Set();
        
        // 플레이어가 무적 상태이거나 리스폰 중이거나 생명이 0이면 충돌 검사 건너뛰기
        if (this.player.invincible || this.player.respawning || this.lives <= 0) {
            // 충돌 검사는 하되, 플레이어와의 충돌은 무시
        } else {
            let playerHit = false; // 플레이어가 한 번이라도 맞았는지 확인
            
            // 플레이어와 적 충돌
            for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex++) {
                const enemy = this.enemies[enemyIndex];
                if (enemy && this.isColliding(this.player, enemy) && !playerHit) {
                    enemiesToRemoveSet.add(enemyIndex);
                    this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff4444');
                    this.playSound('playerHit');
                    
                    // 생명 감소 (정수로 확실히 처리, 한 번에 최대 1씩만 감소)
                    const damageToTake = Math.min(1, Math.floor(enemy.damage));
                    this.lives = Math.max(0, Math.floor(this.lives - damageToTake));
                    console.log('적과 충돌 후 생명:', this.lives, '받은 데미지:', damageToTake);
                    
                    if (this.lives > 0) {
                        // 생명이 남아있으면 무적 상태와 리스폰
                        this.player.invincible = true;
                        this.player.invincibleTime = 60;
                        this.player.respawning = true;
                        this.player.respawnTime = 30;
                        
                        // 생명이 줄어들었으므로 총알을 기본 설정으로 리셋
                        console.log('생명 감소 - 총알 기본 설정으로 리셋');
                        this.bulletType = 'normal';
                        this.bulletPower = 1;
                        this.bulletLevel = 1;
                        this.shotCooldown = 100;
                        
                        this.updateUI();
                        playerHit = true;
                        break;
                    } else {
                        // 생명이 0 이하면 즉시 게임 오버
                        this.lives = 0;
                        // 무적 상태와 리스폰 상태 즉시 해제
                        this.player.invincible = false;
                        this.player.invincibleTime = 0;
                        this.player.respawning = false;
                        this.player.respawnTime = 0;
                        this.updateUI(); // 생명 0을 먼저 표시
                        this.gameRunning = false;
                        this.gameOver();
                        return;
                    }
                }
            }
            
            // 플레이어와 장애물 충돌 (아직 맞지 않았다면)
            if (!playerHit) {
                for (let obstacleIndex = 0; obstacleIndex < this.obstacles.length; obstacleIndex++) {
                    const obstacle = this.obstacles[obstacleIndex];
                    if (obstacle && this.isColliding(this.player, obstacle)) {
                        obstaclesToRemoveSet.add(obstacleIndex);
                        this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff4444');
                        this.playSound('playerHit');
                        
                        // 생명 감소 (정수로 확실히 처리)
                        this.lives = Math.max(0, Math.floor(this.lives - 1));
                        console.log('장애물과 충돌 후 생명:', this.lives);
                        
                        if (this.lives > 0) {
                            // 생명이 남아있으면 무적 상태와 리스폰
                            this.player.invincible = true;
                            this.player.invincibleTime = 60;
                            this.player.respawning = true;
                            this.player.respawnTime = 30;
                            
                            // 생명이 줄어들었으므로 총알을 기본 설정으로 리셋
                            console.log('생명 감소 - 총알 기본 설정으로 리셋');
                            this.bulletType = 'normal';
                            this.bulletPower = 1;
                            this.bulletLevel = 1;
                            this.shotCooldown = 100;
                            
                            this.updateUI();
                            playerHit = true;
                            break;
                        } else {
                            // 생명이 0 이하면 즉시 게임 오버
                            this.lives = 0;
                            // 무적 상태와 리스폰 상태 즉시 해제
                            this.player.invincible = false;
                            this.player.invincibleTime = 0;
                            this.player.respawning = false;
                            this.player.respawnTime = 0;
                            this.updateUI(); // 생명 0을 먼저 표시
                            this.gameRunning = false;
                            this.gameOver();
                            return;
                        }
                    }
                }
            }
        }
        
        // 총알과 적 충돌
        for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
            const bullet = this.bullets[bulletIndex];
            if (!bullet) continue;
            
            for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex++) {
                const enemy = this.enemies[enemyIndex];
                if (!enemy) continue;
                
                if (this.isColliding(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    bulletsToRemoveSet.add(bulletIndex);
                    this.createParticles(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.color);
                    this.playSound('explosion');
                    
                    if (enemy.health <= 0) {
                        enemiesToRemoveSet.add(enemyIndex);
                        const oldScore = this.score;
                        
                        // 레벨에 따른 점수 차등 적용 (높은 레벨일수록 점수 감소)
                        let scoreGain = 100;
                        if (this.level >= 5) {
                            scoreGain = Math.max(50, 100 - (this.level - 4) * 10); // 레벨 5부터 점수 감소
                        }
                        if (this.level >= 10) {
                            scoreGain = Math.max(30, 60 - (this.level - 9) * 5); // 레벨 10부터 더 큰 감소
                        }
                        
                        this.score += scoreGain;
                        console.log(`적 처치 - 점수 증가: ${oldScore} -> ${this.score} (레벨 ${this.level}, 획득 점수: ${scoreGain})`);
                        this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff4444');
                        this.playSound('enemyDestroy');
                    }
                }
            }
        }
        
        // 총알과 장애물 충돌
        for (let bulletIndex = 0; bulletIndex < this.bullets.length; bulletIndex++) {
            const bullet = this.bullets[bulletIndex];
            if (!bullet) continue;
            
            for (let obstacleIndex = 0; obstacleIndex < this.obstacles.length; obstacleIndex++) {
                const obstacle = this.obstacles[obstacleIndex];
                if (!obstacle) continue;
                
                if (this.isColliding(bullet, obstacle)) {
                    bulletsToRemoveSet.add(bulletIndex);
                    obstaclesToRemoveSet.add(obstacleIndex);
                    this.createParticles(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.color);
                    this.playSound('explosion');
                    
                    // 레벨에 따른 장애물 점수 차등 적용
                    let obstacleScore = 50;
                    if (this.level >= 5) {
                        obstacleScore = Math.max(25, 50 - (this.level - 4) * 5); // 레벨 5부터 점수 감소
                    }
                    if (this.level >= 10) {
                        obstacleScore = Math.max(15, 30 - (this.level - 9) * 3); // 레벨 10부터 더 큰 감소
                    }
                    
                    this.score += obstacleScore;
                }
            }
        }
        
        // 플레이어와 아이템 충돌
        for (let itemIndex = 0; itemIndex < this.items.length; itemIndex++) {
            const item = this.items[itemIndex];
            if (!item) continue;
            
            if (this.isColliding(this.player, item)) {
                this.collectItem(item.type);
                itemsToRemoveSet.add(itemIndex);
                this.createParticles(item.x + item.width / 2, item.y + item.height / 2, item.color);
                this.playSound('item');
            }
        }
        
        // Set을 배열로 변환하고 역순으로 정렬
        const enemiesToRemoveArray = Array.from(enemiesToRemoveSet).sort((a, b) => b - a);
        const obstaclesToRemoveArray = Array.from(obstaclesToRemoveSet).sort((a, b) => b - a);
        const bulletsToRemoveArray = Array.from(bulletsToRemoveSet).sort((a, b) => b - a);
        const itemsToRemoveArray = Array.from(itemsToRemoveSet).sort((a, b) => b - a);
        
        // 제거할 객체들을 역순으로 제거 (인덱스 꼬임 방지)
        enemiesToRemoveArray.forEach(index => {
            if (index < this.enemies.length) {
                this.enemies.splice(index, 1);
            }
        });
        
        obstaclesToRemoveArray.forEach(index => {
            if (index < this.obstacles.length) {
                this.obstacles.splice(index, 1);
            }
        });
        
        bulletsToRemoveArray.forEach(index => {
            if (index < this.bullets.length) {
                this.bullets.splice(index, 1);
            }
        });
        
        itemsToRemoveArray.forEach(index => {
            if (index < this.items.length) {
                this.items.splice(index, 1);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectItem(itemType) {
        switch (itemType) {
            case 'rapid':
                if (this.bulletType === 'rapid') {
                    this.bulletLevel++;
                    this.bulletPower += 0.5; // 강화량 증가
                    this.shotCooldown = Math.max(50, this.shotCooldown - 10); // 발사 속도도 증가
                } else {
                    this.bulletType = 'rapid';
                    this.bulletLevel = 1;
                    this.bulletPower = 1.5; // 초기 데미지 증가
                    this.shotCooldown = 80; // 기본 발사 속도
                }
                break;
                
            case 'spread':
                if (this.bulletType === 'spread') {
                    this.bulletLevel++;
                    this.bulletPower += 0.5;
                    // 스프레드 각도 증가 (최대 5발까지)
                    if (this.bulletLevel <= 5) {
                        this.bulletLevel = Math.min(5, this.bulletLevel);
                    }
                } else {
                    this.bulletType = 'spread';
                    this.bulletLevel = 1;
                    this.bulletPower = 1.5;
                }
                break;
                
            case 'laser':
                if (this.bulletType === 'laser') {
                    this.bulletLevel++;
                    this.bulletPower += 0.8; // 레이저는 더 강한 강화
                } else {
                    this.bulletType = 'laser';
                    this.bulletLevel = 1;
                    this.bulletPower = 2; // 레이저 초기 데미지 높음
                }
                break;
                
            case 'bomb':
                if (this.bulletType === 'bomb') {
                    this.bulletLevel++;
                    this.bulletPower += 1; // 폭탄은 가장 강한 강화
                } else {
                    this.bulletType = 'bomb';
                    this.bulletLevel = 1;
                    this.bulletPower = 3; // 폭탄 초기 데미지 최고
                }
                break;
                
            case 'shield':
                // 실드 아이템 강화 (무적 시간 증가)
                this.player.invincibleTime = Math.max(this.player.invincibleTime, 90); // 최대 90프레임
                this.createParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00ffff');
                break;
                
            case 'life':
                console.log(`생명 아이템 수집! 현재 생명: ${this.lives}`);
                this.lives = Math.min(10, Math.floor(this.lives + 1));
                console.log(`생명 아이템 수집 후 생명: ${this.lives}`);
                break;
        }
    }
    
    initSounds() {
        this.audioGenerator = window.audioGenerator;
        this.soundEnabled = true; // 기본적으로 사운드 활성화
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundToggle');
        soundBtn.textContent = this.soundEnabled ? '🔇 소리 끄기' : '🔊 소리 켜기';
    }
    
    playSound(soundName) {
        console.log('사운드 재생 시도:', soundName, '사운드 활성화:', this.soundEnabled, '오디오 생성기:', !!this.audioGenerator);
        
        if (!this.soundEnabled) {
            console.log('사운드가 비활성화되어 있습니다.');
            return;
        }
        
        if (!this.audioGenerator) {
            console.log('오디오 생성기가 없습니다.');
            return;
        }
        
        try {
            switch (soundName) {
                case 'shoot':
                    console.log('발사음 재생');
                    this.audioGenerator.createShootSound();
                    break;
                case 'explosion':
                    console.log('폭발음 재생');
                    this.audioGenerator.createExplosionSound();
                    break;
                case 'item':
                    console.log('아이템음 재생');
                    this.audioGenerator.createItemSound();
                    break;
                case 'levelUp':
                    console.log('레벨업음 재생');
                    this.audioGenerator.createLevelUpSound();
                    break;
                case 'gameOver':
                    console.log('게임오버음 재생');
                    this.audioGenerator.createGameOverSound();
                    break;
                case 'enemyDestroy':
                    console.log('적기 파괴음 재생');
                    this.audioGenerator.createEnemyDestroySound();
                    break;
                case 'playerHit':
                    console.log('플레이어 피격음 재생');
                    this.audioGenerator.createPlayerHitSound();
                    break;
            }
        } catch (error) {
            console.log('사운드 재생 오류:', error);
        }
    }
    
    draw() {
        // 배경 지우기
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 별 그리기
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        
        // 총알 그리기
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            if (bullet.type === 'laser') {
                this.ctx.shadowColor = bullet.color;
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
                this.ctx.shadowBlur = 0;
            }
        });
        
        // 적 그리기
        this.enemies.forEach(enemy => {
            this.drawAirplane(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color, 'enemy', enemy.type);
        });
        
        // 장애물 그리기
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // 아이템 그리기
        this.items.forEach(item => {
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
            
            this.ctx.shadowColor = item.color;
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
            this.ctx.shadowBlur = 0;
        });
        
        // 플레이어 그리기
        if (!this.player.respawning) {
            if (this.player.invincible) {
                // 무적 상태일 때 깜빡임 효과
                if (Math.floor(this.player.invincibleTime / 10) % 2 === 0) {
                    this.drawAirplane(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color, 'player');
                }
            } else {
                this.drawAirplane(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color, 'player');
            }
        }
        
        // 파티클 그리기
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });
    }
    
    drawAirplane(x, y, width, height, color, type, enemyType = 'basic') {
        this.ctx.fillStyle = color;
        
        if (type === 'player') {
            // 플레이어 비행기 (삼각형 모양)
            this.ctx.beginPath();
            this.ctx.moveTo(x + width / 2, y);
            this.ctx.lineTo(x, y + height);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 날개
            this.ctx.fillRect(x + width * 0.2, y + height * 0.6, width * 0.6, height * 0.2);
            
            // 조종석
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x + width * 0.4, y + height * 0.2, width * 0.2, height * 0.3);
        } else {
            // 적 비행기 타입별 모양
            switch (enemyType) {
                case 'fast':
                    // 빠른 적기 (작고 날렵한 모양)
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + width / 2, y + height);
                    this.ctx.lineTo(x + width * 0.1, y + height * 0.3);
                    this.ctx.lineTo(x + width * 0.9, y + height * 0.3);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // 작은 날개
                    this.ctx.fillRect(x + width * 0.3, y + height * 0.4, width * 0.4, height * 0.15);
                    break;
                    
                case 'tank':
                    // 탱크 적기 (육중한 모양)
                    this.ctx.fillRect(x + width * 0.1, y + height * 0.2, width * 0.8, height * 0.6);
                    this.ctx.fillRect(x + width * 0.2, y + height * 0.1, width * 0.6, height * 0.3);
                    this.ctx.fillRect(x + width * 0.3, y + height * 0.8, width * 0.4, height * 0.2);
                    
                    // 장갑판 효과
                    this.ctx.fillStyle = '#440088';
                    this.ctx.fillRect(x + width * 0.15, y + height * 0.25, width * 0.7, height * 0.5);
                    this.ctx.fillStyle = color;
                    break;
                    
                case 'boss':
                    // 보스 적기 (거대하고 위협적인 모양)
                    this.ctx.fillRect(x + width * 0.05, y + height * 0.1, width * 0.9, height * 0.8);
                    this.ctx.fillRect(x + width * 0.15, y + height * 0.05, width * 0.7, height * 0.4);
                    this.ctx.fillRect(x + width * 0.25, y + height * 0.85, width * 0.5, height * 0.15);
                    
                    // 보스 장식
                    this.ctx.fillStyle = '#880000';
                    this.ctx.fillRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.6);
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(x + width * 0.3, y + height * 0.3, width * 0.4, height * 0.4);
                    this.ctx.fillStyle = color;
                    break;
                    
                case 'stealth':
                    // 스텔스 적기 (다이아몬드 모양, 반투명)
                    this.ctx.fillStyle = 'rgba(102, 102, 102, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + width / 2, y);
                    this.ctx.lineTo(x + width, y + height / 2);
                    this.ctx.lineTo(x + width / 2, y + height);
                    this.ctx.lineTo(x, y + height / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // 스텔스 효과 (깜빡임과 그림자)
                    if (Math.floor(Date.now() / 150) % 2 === 0) {
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        this.ctx.fillRect(x + width * 0.25, y + height * 0.25, width * 0.5, height * 0.5);
                    }
                    
                    // 스텔스 표시 (S)
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = `${Math.max(8, width * 0.3)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('S', x + width / 2, y + height / 2 + 3);
                    this.ctx.fillStyle = color;
                    break;
                    
                case 'kamikaze':
                    // 카미카제 적기 (화살표 모양)
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + width / 2, y + height);
                    this.ctx.lineTo(x + width * 0.2, y + height * 0.2);
                    this.ctx.lineTo(x + width * 0.8, y + height * 0.2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // 카미카제 효과 (빨간 불꽃과 폭발 효과)
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(x + width * 0.4, y + height * 0.1, width * 0.2, height * 0.1);
                    
                    // 폭발 효과 (깜빡임)
                    if (Math.floor(Date.now() / 100) % 2 === 0) {
                        this.ctx.fillStyle = '#ffff00';
                        this.ctx.fillRect(x + width * 0.3, y + height * 0.05, width * 0.4, height * 0.15);
                    }
                    
                    // 카미카제 표시 (K)
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = `${Math.max(8, width * 0.3)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('K', x + width / 2, y + height / 2 + 3);
                    this.ctx.fillStyle = color;
                    break;
                    
                case 'laser':
                    // 레이저 적기 (레이저 총 모양)
                    this.ctx.fillRect(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.6);
                    this.ctx.fillRect(x + width * 0.1, y + height * 0.4, width * 0.8, height * 0.2);
                    
                    // 레이저 총구
                    this.ctx.fillStyle = '#ffff00';
                    this.ctx.fillRect(x + width * 0.45, y + height * 0.1, width * 0.1, height * 0.1);
                    
                    // 레이저 효과 (깜빡임과 빔)
                    if (Math.floor(Date.now() / 50) % 2 === 0) {
                        this.ctx.fillStyle = '#00ffff';
                        this.ctx.fillRect(x + width * 0.45, y, width * 0.1, height * 0.1);
                        
                        // 레이저 빔 효과
                        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                        this.ctx.fillRect(x + width * 0.45, y - 20, width * 0.1, 20);
                    }
                    
                    // 레이저 표시 (L)
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = `${Math.max(8, width * 0.3)}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText('L', x + width / 2, y + height / 2 + 3);
                    this.ctx.fillStyle = color;
                    break;
                    
                default: // basic
                    // 기본 적기 (역삼각형 모양)
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + width / 2, y + height);
                    this.ctx.lineTo(x, y);
                    this.ctx.lineTo(x + width, y);
                    this.ctx.closePath();
                    this.ctx.fill();
                    
                    // 날개
                    this.ctx.fillRect(x + width * 0.2, y + height * 0.2, width * 0.6, height * 0.2);
                    
                    // 조종석
                    this.ctx.fillStyle = '#ff0000';
                    this.ctx.fillRect(x + width * 0.4, y + height * 0.5, width * 0.2, height * 0.3);
                    this.ctx.fillStyle = color;
                    break;
            }
        }
    }
    
    updateUI() {
        console.log('UI 업데이트 - 현재 레벨:', this.level);
        
        // 게임이 실행 중일 때만 UI 업데이트
       // if (this.gameRunning) {
            document.getElementById('score').textContent = this.score.toLocaleString();
            document.getElementById('lives').textContent = Math.floor(this.lives); // 정수로 표시
            document.getElementById('level').textContent = this.level;
            
            console.log('레벨 UI 업데이트 완료:', document.getElementById('level').textContent);
            
            const weaponNames = {
                'normal': '일반',
                'rapid': '연사',
                'spread': '산탄',
                'laser': '레이저',
                'bomb': '폭탄'
            }; 
            
            document.getElementById('weapon').textContent = weaponNames[this.bulletType] || '일반';
            document.getElementById('weaponLevel').textContent = `Lv.${this.bulletLevel}`;
        //}
    }
    
    gameLoop() {
        try {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('게임 루프 오류:', error);
            // 오류 발생 시에도 게임 루프 계속 실행
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// 게임 시작
window.addEventListener('load', () => {
    new ShootingGame();
}); 