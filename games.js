// games.js - Updated to use unified user system

// Wait for user system to initialize
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure user-system.js loads first
    setTimeout(initializeGamesPage, 100);
});

function initializeGamesPage() {
    // Game data
    const games = [
        {
            id: 0,
            title: "SCHOOL FIGHTER",
            description: "A game created for my digital tech course work based on then popular fighting game Mortal Kombat.",
            logo: "images/game1-logo.png",
            genre: "Action Arcade Fighter",
            platform: "itch.io",
            release: "2025",
            playUrl: "https://refill-studios.itch.io/school-fighter"
        },
        {
            id: 1,
            title: "BOWLING FRIENDS",
            description: "A psychological horror visual novel about a boy who go bowling, but things take a dark turn.",
            logo: "images/game2-logo.png",
            genre: "Psycological Horror Visual Novel",
            platform: "itch.io",
            release: "2022",
            playUrl: "https://refill-studios.itch.io/bowling-friends"
        },
        {
            id: 2,
            title: "SQUARE UP",
            description: "A fast-paced arcade top-down shooter where players control squares battling it out in multiplayer arenas.",
            logo: "images/game3-logo.png",
            genre: "Arcade Top-down Multiplayer Shooter",
            platform: "itch.io",
            release: "2024",
            playUrl: "https://refill-studios.itch.io/square-up"
        },
        {
            id: 3,
            title: "WHACK WIZARDS",
            description: "A fun fantasy game where the player must whack enemies using their spells!",
            logo: "images/game4-logo.png",
            genre: "Arcade card simple rougelike",
            platform: "itch.io",
            release: "2026",
            playUrl: "https://refill-studios.itch.io/whack-wizards"
        },
    ];

    // DOM Elements
    const gameTitleMain = document.querySelector('.game-title-main');
    const gameDescriptionMain = document.querySelector('.game-description-main');
    const playButtonMain = document.querySelector('.play-game-btn-main');
    const detailValuesMain = document.querySelectorAll('.detail-value-main');
    const dots = document.querySelectorAll('.dot');
    
    const leftArrow = document.querySelector('.arrow-left-container');
    const rightArrow = document.querySelector('.arrow-right-container');
    
    const prevLogoImg = document.querySelector('.prev-logo .carousel-logo');
    const currentLogoImg = document.querySelector('.logo-current .carousel-logo');
    const nextLogoImg = document.querySelector('.next-logo .carousel-logo');
    const prevLogoContainer = document.querySelector('.prev-logo');
    const currentLogoContainer = document.querySelector('.logo-current');
    const nextLogoContainer = document.querySelector('.next-logo');

    let currentIndex = 0;
    let isAnimating = false;

    // Function to get previous index
    function getPrevIndex() {
        return currentIndex === 0 ? games.length - 1 : currentIndex - 1;
    }

    // Function to get next index
    function getNextIndex() {
        return currentIndex === games.length - 1 ? 0 : currentIndex + 1;
    }

    // Update ALL logos based on current index
    function updateAllLogos() {
        const prevIndex = getPrevIndex();
        const nextIndex = getNextIndex();
        
        prevLogoImg.src = games[prevIndex].logo;
        prevLogoImg.alt = games[prevIndex].title;
        
        currentLogoImg.src = games[currentIndex].logo;
        currentLogoImg.alt = games[currentIndex].title;
        
        nextLogoImg.src = games[nextIndex].logo;
        nextLogoImg.alt = games[nextIndex].title;
    }

    // Update game information
    function updateGameInfo() {
        const game = games[currentIndex];
        
        if (gameTitleMain) gameTitleMain.textContent = game.title;
        if (gameDescriptionMain) gameDescriptionMain.textContent = game.description;
        
        if (detailValuesMain.length >= 3) {
            detailValuesMain[0].textContent = game.genre;
            detailValuesMain[1].textContent = game.platform;
            detailValuesMain[2].textContent = game.release;
        }

        if (playButtonMain) {
            const playButtonText = playButtonMain.querySelector('span');
            if (playButtonText) {
                playButtonText.textContent = `PLAY ${game.title}`;
            }

            // Remove old listener and add new one
            playButtonMain.replaceWith(playButtonMain.cloneNode(true));
            const newPlayButton = document.querySelector('.play-game-btn-main');
            if (newPlayButton) {
                newPlayButton.addEventListener('click', () => {
                    const currentGame = games[currentIndex];
                    if (currentGame.playUrl) {
                        window.open(currentGame.playUrl, '_blank');
                    } else {
                        alert(`No play link available for ${currentGame.title}`);
                    }
                });
            }
        }

        // Update active dot
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.index) === currentIndex) {
                dot.classList.add('active');
            }
        });
    }

    // Reset all logos to their default positions
    function resetLogoPositions() {
        prevLogoContainer.style.transition = 'none';
        currentLogoContainer.style.transition = 'none';
        nextLogoContainer.style.transition = 'none';
        
        prevLogoContainer.style.left = '15%';
        prevLogoContainer.style.transform = 'translateX(-50%) scale(0.95)';
        prevLogoContainer.style.opacity = '0.7';
        prevLogoContainer.style.zIndex = '3';
        
        currentLogoContainer.style.left = '50%';
        currentLogoContainer.style.transform = 'translateX(-50%) scale(1)';
        currentLogoContainer.style.opacity = '1';
        currentLogoContainer.style.zIndex = '5';
        
        nextLogoContainer.style.right = '15%';
        nextLogoContainer.style.transform = 'translateX(50%) scale(0.95)';
        nextLogoContainer.style.opacity = '0.7';
        nextLogoContainer.style.zIndex = '3';
        
        void prevLogoContainer.offsetWidth;
        
        prevLogoContainer.style.transition = 'all 0.5s ease';
        currentLogoContainer.style.transition = 'all 0.5s ease';
        nextLogoContainer.style.transition = 'all 0.5s ease';
    }

    // Animate to next game
    function animateToNext() {
        if (isAnimating) return;
        isAnimating = true;
        
        currentLogoContainer.style.left = '15%';
        currentLogoContainer.style.transform = 'translateX(-50%) scale(0.95)';
        currentLogoContainer.style.opacity = '0.7';
        currentLogoContainer.style.zIndex = '3';
        
        nextLogoContainer.style.right = '50%';
        nextLogoContainer.style.transform = 'translateX(50%) scale(1)';
        nextLogoContainer.style.opacity = '1';
        nextLogoContainer.style.zIndex = '5';
        
        prevLogoContainer.style.left = '85%';
        prevLogoContainer.style.opacity = '0.3';
        
        setTimeout(() => {
            currentIndex = getNextIndex();
            updateAllLogos();
            updateGameInfo();
            resetLogoPositions();
            isAnimating = false;
        }, 500);
    }

    // Animate to previous game
    function animateToPrev() {
        if (isAnimating) return;
        isAnimating = true;
        
        currentLogoContainer.style.left = '85%';
        currentLogoContainer.style.transform = 'translateX(-50%) scale(0.95)';
        currentLogoContainer.style.opacity = '0.7';
        currentLogoContainer.style.zIndex = '3';
        
        prevLogoContainer.style.left = '50%';
        prevLogoContainer.style.transform = 'translateX(-50%) scale(1)';
        prevLogoContainer.style.opacity = '1';
        prevLogoContainer.style.zIndex = '5';
        
        nextLogoContainer.style.right = '85%';
        nextLogoContainer.style.opacity = '0.3';
        
        setTimeout(() => {
            currentIndex = getPrevIndex();
            updateAllLogos();
            updateGameInfo();
            resetLogoPositions();
            isAnimating = false;
        }, 500);
    }

    function nextGame() { animateToNext(); }
    function prevGame() { animateToPrev(); }

    function goToGame(index) {
        if (isAnimating || currentIndex === index) return;
        currentIndex = index;
        updateAllLogos();
        updateGameInfo();
        resetLogoPositions();
    }

    // Event Listeners
    if (leftArrow) leftArrow.addEventListener('click', prevGame);
    if (rightArrow) rightArrow.addEventListener('click', nextGame);
    if (prevLogoContainer) prevLogoContainer.addEventListener('click', prevGame);
    if (nextLogoContainer) nextLogoContainer.addEventListener('click', nextGame);
    
    if (currentLogoContainer) {
        currentLogoContainer.addEventListener('click', () => {
            currentLogoContainer.style.transform = 'translateX(-50%) scale(1.08)';
            setTimeout(() => {
                currentLogoContainer.style.transform = 'translateX(-50%) scale(1)';
            }, 200);
        });
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetIndex = parseInt(dot.dataset.index);
            goToGame(targetIndex);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevGame();
        if (e.key === 'ArrowRight') nextGame();
    });

    // Auto-rotate
    let autoRotate = setInterval(nextGame, 5000);
    const carouselArea = document.querySelector('.logo-carousel-container');
    if (carouselArea) {
        carouselArea.addEventListener('mouseenter', () => clearInterval(autoRotate));
        carouselArea.addEventListener('mouseleave', () => {
            autoRotate = setInterval(nextGame, 5000);
        });
    }

    // Initialize
    updateAllLogos();
    updateGameInfo();
    resetLogoPositions();
    
    console.log('Games page initialized with user:', window.currentUser);
}