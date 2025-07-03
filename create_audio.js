// Web Audio API를 사용하여 간단한 사운드 생성
class AudioGenerator {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // 발사음 생성 (더 예쁜 멜로디)
    createShootSound() {
        // 메인 발사음
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.15);
        
        // 하모닉스 추가
        const harmonic = this.audioContext.createOscillator();
        const harmonicGain = this.audioContext.createGain();
        
        harmonic.connect(harmonicGain);
        harmonicGain.connect(this.audioContext.destination);
        
        harmonic.frequency.setValueAtTime(1600, this.audioContext.currentTime);
        harmonic.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
        
        harmonicGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        harmonic.start(this.audioContext.currentTime);
        harmonic.stop(this.audioContext.currentTime + 0.1);
    }

    // 폭발음 생성 (더 음악적인 폭발음)
    createExplosionSound() {
        // 메인 폭발음 (베이스)
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        
        oscillator1.connect(gainNode1);
        gainNode1.connect(this.audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator1.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode1.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator1.start(this.audioContext.currentTime);
        oscillator1.stop(this.audioContext.currentTime + 0.3);
        
        // 중간 톤 폭발음
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator2.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.25);
        
        gainNode2.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        
        oscillator2.start(this.audioContext.currentTime);
        oscillator2.stop(this.audioContext.currentTime + 0.25);
        
        // 고음 폭발음 (스파클 효과)
        const oscillator3 = this.audioContext.createOscillator();
        const gainNode3 = this.audioContext.createGain();
        
        oscillator3.connect(gainNode3);
        gainNode3.connect(this.audioContext.destination);
        
        oscillator3.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator3.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        
        gainNode3.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator3.start(this.audioContext.currentTime);
        oscillator3.stop(this.audioContext.currentTime + 0.2);
    }

    // 아이템 수집음 생성 (더 예쁜 멜로디)
    createItemSound() {
        // 상승하는 멜로디
        const notes = [600, 800, 1000, 1200, 1400];
        const noteDuration = 0.08;
        
        notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime + index * noteDuration);
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime + index * noteDuration);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (index + 1) * noteDuration);
            
            oscillator.start(this.audioContext.currentTime + index * noteDuration);
            oscillator.stop(this.audioContext.currentTime + (index + 1) * noteDuration);
        });
        
        // 하모닉스 추가
        setTimeout(() => {
            const harmonic = this.audioContext.createOscillator();
            const harmonicGain = this.audioContext.createGain();
            
            harmonic.connect(harmonicGain);
            harmonicGain.connect(this.audioContext.destination);
            
            harmonic.frequency.setValueAtTime(1600, this.audioContext.currentTime);
            harmonic.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
            
            harmonicGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            harmonicGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            harmonic.start(this.audioContext.currentTime);
            harmonic.stop(this.audioContext.currentTime + 0.2);
        }, 100);
    }

    // 레벨업음 생성 (더 화려한 멜로디)
    createLevelUpSound() {
        // 상승하는 화음
        const chord1 = [400, 500, 600]; // C major chord
        const chord2 = [600, 750, 900]; // G major chord
        const chord3 = [800, 1000, 1200]; // C major octave
        
        // 첫 번째 화음
        chord1.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        });
        
        // 두 번째 화음 (0.3초 후)
        setTimeout(() => {
            chord2.forEach(note => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.3);
            });
        }, 300);
        
        // 세 번째 화음 (0.6초 후)
        setTimeout(() => {
            chord3.forEach(note => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.4);
            });
        }, 600);
    }

    // 게임오버음 생성 (더 드라마틱한 소리)
    createGameOverSound() {
        // 하강하는 멜로디
        const notes = [600, 500, 400, 300, 200, 150, 100];
        const noteDuration = 0.2;
        
        notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(note, this.audioContext.currentTime + index * noteDuration);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime + index * noteDuration);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + (index + 1) * noteDuration);
            
            oscillator.start(this.audioContext.currentTime + index * noteDuration);
            oscillator.stop(this.audioContext.currentTime + (index + 1) * noteDuration);
        });
        
        // 베이스 드럼 효과
        setTimeout(() => {
            const bass = this.audioContext.createOscillator();
            const bassGain = this.audioContext.createGain();
            
            bass.connect(bassGain);
            bassGain.connect(this.audioContext.destination);
            
            bass.frequency.setValueAtTime(80, this.audioContext.currentTime);
            bass.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.5);
            
            bassGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
            bassGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            bass.start(this.audioContext.currentTime);
            bass.stop(this.audioContext.currentTime + 0.5);
        }, 800);
    }

    // 새로운 소리: 적기 파괴음
    createEnemyDestroySound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.25, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 새로운 소리: 플레이어 피격음
    createPlayerHitSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // 범용 톤 재생 메서드
    playTone(frequency, duration, type = 'sine') {
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.log('톤 재생 오류:', error);
        }
    }

}

// 전역 변수로 오디오 생성기 생성
window.audioGenerator = new AudioGenerator(); 