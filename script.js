document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. MOTS-CLÉS DE NUTRIMUSCLE
    // ----------------------------------------------------
    const WORD_LIST = [
        // --- NUTRIMUSCLE & PRODUITS ---
        "WHEY", "CASEINE", "CREATINE", "SHAKER", "PROTEINE", "MUSCLE", "ISOLAT", 
        "HYDRO", "NUTRITION", "COMPLEMENT", "AMINOS", "PEPTIDE", "VITAMINE", "MINERAUX", 
        "OATMEAL", "GAINER", "BARRE", "CONCENTRE", "PURETE", "QUALITE", "SERUM",
        "GLUTAMINE", "BCAA", "CITRULINE", "ARGININE", "ELECTROLYTES", "OMEGA", "PURE", 
        "NUTRIMUSCLE", // Mots plus longs possibles
        "COLLAGENE", 
    
        // --- MUSCULATION : Mouvements & Exercices ---
        "POMPE", "SQUAT", "TRACTION", "FENTES", "DIPS", "CURLS", "PRESSE", 
        "ROWING", "DEVE", "GAINAGE", "EXTENSION", "FLEXION", "TIRAGE", "ELEVATION",
        "POULET", // Clin d'œil à la diète
        "ECHAUFFEMENT", "ETIREMENT", "REPETITION", "SERIE", "CHARGE", "INTENSITE",
        "DEVELOPPE", "HALTERE", "BARRE", "KETTLEBELL", "MACHINE", "BANCS", 
        "TERRE", // Soulevé de terre
        "MILITAIRE", // Développé militaire
        "MOLETS", "QUADRI", "ISCHIOS", "PEC", "DELTOIDE", "TRICEPS", "BICEPS", "ABDOS",
        "TRAPÈZES", "DORSEAUX", "LOMBAIRES",
    
        // --- MUSCULATION : Terminologie & Concepts ---
        "FORCE", "ENDURANCE", "VOLUME", "MASSE", "SECHE", "PRISE", "PERTE", 
        "RECUP", "RECUPERATION", "SURCHARGE", "PROGRESSION", "HYPERTROPHIE", 
        "CALORIES", "MACROS", "MICRO", "FIBRES", "METABOLISME", "ANABOLIQUE", "CATABOLIQUE",
        "GYMNASE", "SALLE", "TRAINING", "ENTRAINEMENT", "DIETE", "MACRONUTRIMENT",
        "REPOS", "PRISES", // Prises alimentaires
        "CARDIO", "PHYSIQUE", "MORPHOLOGIE", "ECTOMORPHE", "MESOMORPHE", "ENDOMORPHE",
        "PERFORMER", "PERFORMANCE", "RESISTANCE",
    
        // --- NUTRI' EXPERTS & GUNDILL ---
        "GUNDILL", "OLIVIER", "EXPERT", "AUTEUR", "LIVRE", "DOSSIER", "ANALYSE", 
        "CONSEIL", "SCIENCES", "RECHERCHE", "FORMATEUR", "CONFERENCE", "ARTICLE",
        "YOUTUBE", "CHAINE", "SPORT", "PRATIQUE", "THEORIE", "GUIDE", "REFERENCE",
        "METHODE", "PROGRAMME", "EXPERIENCE", "KNOWLEDGE", // Connaissance
        "BIOLOGIE", "PHYSIOLOGIE", "BIOCHIMIE", "ALIMENTS", "CONNAISSANCE"
    ];

    // Paramètres du jeu
    const MAX_TRIES = 6;   // Nombre d'essais
    
    let currentGuess = '';
    let currentRow = 0;
    let solution = '';
    let solutionLength = 0;

    // ----------------------------------------------------
    // 2. INITIALISATION ET UI
    // ----------------------------------------------------

    /** Affiche un message temporaire à l'utilisateur */
    const showMessage = (message, duration = 1500) => {
        const msgContainer = document.getElementById('message-container');
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
            background-color: #333; color: white; padding: 10px 20px;
            border-radius: 5px; z-index: 1000; font-family: sans-serif;
            opacity: 0; transition: opacity 0.3s;
        `;
        msgContainer.appendChild(msgDiv);
        
        // Fading in
        setTimeout(() => { msgDiv.style.opacity = '1'; }, 10);
        
        // Fading out and removing
        setTimeout(() => { msgDiv.style.opacity = '0'; }, duration);
        setTimeout(() => { msgContainer.removeChild(msgDiv); }, duration + 300);
    };

    /** Choisit un mot aléatoire dans la liste. */
    const pickWord = () => {
        const randomIndex = Math.floor(Math.random() * WORD_LIST.length);
        return WORD_LIST[randomIndex].toUpperCase();
    };

    /** Construit la grille de jeu (HTML) en fonction de la longueur du mot. */
    const buildBoard = () => {
        const board = document.getElementById('board');
        board.innerHTML = ''; 

        for (let i = 0; i < MAX_TRIES; i++) {
            const row = document.createElement('div');
            row.classList.add('row');
            
            // Définit le nombre de colonnes CSS pour cette rangée
            row.style.gridTemplateColumns = `repeat(${solutionLength}, 1fr)`; 
            
            for (let j = 0; j < solutionLength; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                tile.setAttribute('id', `tile-${i}-${j}`);
                
                // Le contenu de la case est mis dans un <span> pour le centrage CSS
                const span = document.createElement('span');
                tile.appendChild(span);

                // --- MODIFICATION ICI : Activation uniquement pour la première ligne (i === 0) ---
                if (i === 0 && j === 0) {
                    span.textContent = solution[0]; 
                    tile.classList.add('fixed');
                }
                
                row.appendChild(tile);
            }
            board.appendChild(row);
        }
    };

    /** Construit le clavier virtuel (HTML). */
    const buildKeyboard = () => {
        // (Clavier AZERTY standard français)
        const keys = [
            'A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
            'Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
            '⌫', 'W', 'X', 'C', 'V', 'B', 'N', 'ENTRER'
        ];
        const keyboardContainer = document.getElementById('keyboard-container');
        keyboardContainer.innerHTML = ''; 

        const rows = [
            keys.slice(0, 10),
            keys.slice(10, 20),
            keys.slice(20, 28)
        ];

        rows.forEach(rowKeys => {
            const rowDiv = document.createElement('div');
            rowDiv.classList.add('keyboard-row');
            
            rowKeys.forEach(keyText => {
                const key = document.createElement('div');
                key.classList.add('key');
                key.textContent = keyText;
                key.setAttribute('data-key', keyText);
                
                if (keyText === 'ENTRER' || keyText === '⌫') {
                    key.classList.add('large');
                }

                key.addEventListener('click', () => handleKeyInput(keyText));
                rowDiv.appendChild(key);
            });
            keyboardContainer.appendChild(rowDiv);
        });
    };


    /** Fonction de démarrage du jeu. */
    const initGame = () => {
        document.getElementById('board').innerHTML = '';
        
        solution = pickWord();
        solutionLength = solution.length; 
        
        buildBoard();
        buildKeyboard();
        
        // Initialise l'essai avec la première lettre fixe
        currentGuess = solution[0]; 
    };

    // ----------------------------------------------------
    // 3. LOGIQUE DU JEU
    // ----------------------------------------------------

    /** Met à jour la lettre sur le plateau. */
    const updateBoard = () => {
        const row = document.getElementById('board').querySelector(`.row:nth-child(${currentRow + 1})`);
        if (!row) return;

        // La boucle commence à 0, mais on ignore l'index 0 (première case)
        for (let i = 0; i < solutionLength; i++) {
            const tile = row.querySelector(`.tile:nth-child(${i + 1})`);
            
            // Cibler le <span> à l'intérieur
            const span = tile.querySelector('span'); 
            
            if (i === 0) continue; // On ignore la première case (elle est fixe)

            span.textContent = currentGuess[i] || ''; 
            
            // Met à jour la bordure uniquement si une lettre est tapée
            if (!tile.classList.contains('fixed')) {
                 tile.style.borderColor = currentGuess[i] ? 'var(--color-text)' : 'var(--color-tile-border)';
            }
        }
    };

    /** Gère l'entrée (clavier physique ou virtuel). */
    const handleKeyInput = (key) => {
        key = key.toUpperCase();

        if (key === 'ENTRER' || key === 'ENTER') {
            if (currentGuess.length === solutionLength) {
                checkGuess();
            } else {
                showMessage(`Le mot doit faire ${solutionLength} lettres !`);
            }
        } else if (key === '⌫' || key === 'BACKSPACE') {
            if (currentGuess.length > 1) { // Empêche de supprimer la première lettre
                currentGuess = currentGuess.slice(0, -1);
                updateBoard();
            }
        } else if (key.length === 1 && key.match(/[A-Z]/)) {
            if (currentGuess.length < solutionLength) {
                currentGuess += key;
                updateBoard();
            }
        }
    };

    /** Vérifie le mot entré et applique les couleurs. */
    const checkGuess = () => {
        const guess = currentGuess;
        const solutionLetters = solution.split('');
        const guessLetters = guess.split('');
        
        // 1. Initialisation de la carte des lettres (pour gérer les doublons)
        const solutionMap = {};
        solutionLetters.forEach(letter => {
            solutionMap[letter] = (solutionMap[letter] || 0) + 1;
        });
        
        // Tableau pour stocker les classes finales à appliquer 
        const tileClasses = new Array(solutionLength).fill('absent');

        // 2. Première passe : lettres CORRECTES (Bleu Vif)
        for (let i = 0; i < solutionLength; i++) {
            if (guessLetters[i] === solutionLetters[i]) {
                tileClasses[i] = 'correct';
                solutionMap[guessLetters[i]]--;
            }
        }

        // 3. Deuxième passe : lettres PRÉSENTES (Jaune d'Or) et ABSENTES (Gris Neutre)
        for (let i = 0; i < solutionLength; i++) {
            if (tileClasses[i] === 'correct') continue; 
            
            if (solutionMap[guessLetters[i]] > 0) {
                tileClasses[i] = 'present';
                solutionMap[guessLetters[i]]--;
            }
            // Sinon, tileClasses[i] reste 'absent'
        }

        // 4. Application des classes (Tuiles et Clavier)
        for (let i = 0; i < solutionLength; i++) {
            const tile = document.getElementById(`tile-${currentRow}-${i}`);
            const key = document.querySelector(`.key[data-key="${guessLetters[i]}"]`);
            
            // Applique la classe à la tuile
            tile.classList.add(tileClasses[i]);
            
            // Met à jour la touche du clavier
            if (tileClasses[i] === 'correct') {
                key.classList.remove('absent', 'present');
                key.classList.add('correct');
            } else if (tileClasses[i] === 'present' && !key.classList.contains('correct')) {
                key.classList.remove('absent');
                key.classList.add('present');
            } else if (tileClasses[i] === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
                key.classList.add('absent');
            }
        }

        // 5. Logique de fin de partie
        if (guess === solution) {
            showMessage('Bravo, tu fais partie des Nutri-Experts !', 3000);
            document.removeEventListener('keydown', handleKeydown);
        } else if (currentRow >= MAX_TRIES - 1) {
            showMessage(`Dommage ! Le mot était : ${solution}`, 3000);
            document.removeEventListener('keydown', handleKeydown);
        } else {
            // Passe à l'essai suivant
            currentRow++;
            
            // --- NOUVEAU : Afficher la lettre fixe sur la nouvelle ligne ---
            if (currentRow < MAX_TRIES) {
                const nextTile = document.getElementById(`tile-${currentRow}-0`);
                if (nextTile) {
                    const nextSpan = nextTile.querySelector('span');
                    // On pourrait aussi le faire dans buildBoard, mais c'est plus propre ici
                    nextSpan.textContent = solution[0]; 
                    nextTile.classList.add('fixed');
                }
            }
            // -------------------------------------------------------------
            
            currentGuess = solution[0]; // Réinitialise l'essai avec la première lettre fixe
            updateBoard();
        }
    };

    /** Écoute le clavier physique. */
    const handleKeydown = (e) => {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) { 
            handleKeyInput(e.key);
        }
    };

    // Ajoute l'écouteur pour le clavier physique
    document.addEventListener('keydown', handleKeydown);

    // Lancement du jeu
    initGame();
});