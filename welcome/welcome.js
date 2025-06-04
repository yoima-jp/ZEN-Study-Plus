// ZEN Study Plus Welcome Page JavaScript
// CSP-compliant implementation with enhanced features

class ZenWelcome {
    constructor() {
        this.isLoading = true;
        this.animationQueue = [];
        this.observers = [];
        this.particles = [];
        this.init();
    }

    init() {
        this.setupLoading();
        this.setupScrollAnimations();
        this.setupNavigationEffects();
        this.setupParticleSystem();
        this.setupEventListeners();
        this.initializeFeatureCards();
    }

    // Loading screen management
    setupLoading() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading');
                if (loadingScreen) {
                    loadingScreen.classList.add('hidden');
                }
                this.isLoading = false;
                this.startMainAnimations();
            }, 1000);
        });
    }

    // Initialize scroll-triggered animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.observers.push(observer);

        // Observe feature cards
        window.addEventListener('load', () => {
            const featureCards = document.querySelectorAll('.feature-card');
            const sections = document.querySelectorAll('.hero, .features, .cta');
            
            featureCards.forEach(card => observer.observe(card));
            sections.forEach(section => observer.observe(section));
        });
    }

    // Setup navigation smooth scrolling and effects
    setupNavigationEffects() {
        // Smooth scroll for navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });

        // Header scroll effect
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            const header = document.querySelector('header');
            
            if (header) {
                if (currentScrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }

    // Particle system for background animation
    setupParticleSystem() {
        const canvas = document.getElementById('particles');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Create particles
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(74, 144, 226, ${particle.opacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // Event listeners for interactive elements
    setupEventListeners() {
        // Settings button (main)
        const openSettingsBtn = document.getElementById('openSettingsBtn');
        if (openSettingsBtn) {
            openSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings();
            });
        }

        // Settings button (secondary)
        const openSettingsBtn2 = document.getElementById('openSettingsBtn2');
        if (openSettingsBtn2) {
            openSettingsBtn2.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings();
            });
        }

        // Header settings button
        const headerSettingsBtn = document.getElementById('headerSettingsBtn');
        if (headerSettingsBtn) {
            headerSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings();
            });
        }

        // Quick guide button
        const showQuickGuideBtn = document.getElementById('showQuickGuideBtn');
        if (showQuickGuideBtn) {
            showQuickGuideBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showQuickGuide();
            });
        }

        // Feature toggle buttons
        const toggleButtons = document.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFeatureToggle(button);
            });
        });

        // Action buttons
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleActionButton(button);
            });
        });

        // Get started button
        const getStartedBtn = document.getElementById('getStartedBtn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleGetStarted();
            });
        }

        // Support button
        const supportBtn = document.getElementById('supportBtn');
        if (supportBtn) {
            supportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSupport();
            });
        }
    }

    // Feature card initialization
    initializeFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
            
            // 即座に表示する（テスト用）
            setTimeout(() => {
                card.classList.add('visible');
            }, 500 + index * 100);
            
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Animation methods
    animateElement(element) {
        element.classList.add('animate-in');
        
        if (element.classList.contains('feature-card')) {
            element.classList.add('visible');
            const icon = element.querySelector('.feature-icon');
            if (icon) {
                setTimeout(() => {
                    icon.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        icon.style.transform = 'scale(1)';
                    }, 200);
                }, 300);
            }
        }
    }

    startMainAnimations() {
        const heroContent = document.querySelector('.hero-content');
        const installBadge = document.querySelector('.install-complete');
        
        if (heroContent) {
            heroContent.classList.add('fade-in');
        }
        
        if (installBadge) {
            setTimeout(() => {
                installBadge.classList.add('bounce-in');
            }, 500);
        }
    }

    // Event handlers
    openSettings() {
        // Send message to background script to open popup
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: 'OPEN_POPUP' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('拡張機能のポップアップを開けませんでした:', chrome.runtime.lastError);
                    this.showNotification('設定を開くには、ツールバーの拡張機能アイコンをクリックしてください。', 'info');
                } else {
                    console.log('ポップアップを開きました');
                }
            });
        } else {
            this.showNotification('設定を開くには、ツールバーの拡張機能アイコンをクリックしてください。', 'info');
        }
    }

    handleFeatureToggle(button) {
        const isActive = button.classList.contains('active');
        button.classList.toggle('active');
        
        const featureName = button.getAttribute('data-feature') || 'Unknown';
        const status = isActive ? '無効' : '有効';
        
        this.showNotification(`${featureName}機能を${status}にしました`, 'success');
    }

    handleActionButton(button) {
        const action = button.getAttribute('data-action');
        
        switch(action) {
            case 'tutorial':
                this.startTutorial();
                break;
            case 'import':
                this.importSettings();
                break;
            case 'export':
                this.exportSettings();
                break;
            default:
                console.log('アクションが認識されませんでした:', action);
        }
    }

    handleGetStarted() {
        // Scroll to features section
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        this.showNotification('機能の設定を確認して、学習を始めましょう！', 'info');
    }

    openSupport() {
        // Open support page in new tab
        window.open('https://github.com/yoima-jp/zen-Plus-web/issues', '_blank');
    }

    showQuickGuide() {
        // Show quick guide notification and scroll to features
        this.showNotification('クイックガイド: 下の機能セクションで各機能の詳細を確認できます', 'info');
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            setTimeout(() => {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }
    }

    // Utility methods
    startTutorial() {
        this.showNotification('チュートリアルを開始します...', 'info');
        // Tutorial logic would go here
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const settings = JSON.parse(event.target.result);
                        this.showNotification('設定をインポートしました', 'success');
                        console.log('Imported settings:', settings);
                    } catch (error) {
                        this.showNotification('設定ファイルの読み込みに失敗しました', 'error');
                    }
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    exportSettings() {
        const settings = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            features: {
                focusMode: true,
                timeTracking: true,
                websiteBlocking: false
            }
        };
        
        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zen-study-plus-settings.json';
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('設定をエクスポートしました', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            transition: 'all 0.3s ease',
            transform: 'translateX(400px)',
            opacity: '0'
        });
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#10b981';
                break;
            case 'error':
                notification.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                notification.style.backgroundColor = '#f59e0b';
                break;
            default:
                notification.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.particles = [];
    }
}

// Initialize the welcome page
document.addEventListener('DOMContentLoaded', () => {
    window.zenWelcome = new ZenWelcome();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.zenWelcome) {
        window.zenWelcome.destroy();
    }
});
