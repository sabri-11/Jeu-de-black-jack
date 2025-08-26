/* 
    Règle black Jack : 
    Le croupier tire 2 cartes, une face visible et une face cachée.
    Il distribue 2 cartes à chaque joueur.

    Le but du jeu est de se rapprocher le plus possible de 21 sans dépasser.
    Le joueur peut : 
    - Hit (prendre une carte)
    - Stand (garder les cartes qu'il a)
    - Double (doubler sa mise et prendre une carte)
    - Split (diviser sa main en deux et jouer chaque main séparément)

    Le joueur gagne si :
    - Il obtient un blackjack (21 avec 2 cartes)
    - Il obtient une main plus proche de 21 que le croupier sans dépasser

*/

window.addEventListener("load", () =>
{
    const miseVoulue = document.getElementById("entrerMise");
    const btnMise = document.getElementById("miser");
    const btnHit = document.getElementById("hit");
    const btnStand = document.getElementById("stand");
    const btnDouble = document.getElementById("double");
    const btnQuitter = document.getElementById("quitter");

    const btnLancerTour = document.getElementById("lancerTour");

    function afficherMain(acteur, type)
    {
        const handContainer = document.getElementById(`hand-${type}`);
        const scoreElem     = document.getElementById(`score-${type}`);
        handContainer.innerHTML = "";
        acteur.main.cartes.forEach(c =>
        {
            const div = document.createElement("div");
            div.className = "carte";
            let val = c.getValeurBase();
            div.textContent = val;
            handContainer.appendChild(div);
        });
        scoreElem.textContent = `Score : ${acteur.main.getScore()}`;
    }

    function afficherArgent(joueur)
    {
        document.getElementById("argent-joueur")
                .textContent = `Jetons : ${joueur.argent}`;
    }

    // CORRECTION: Ajout d'une fonction pour désactiver les boutons d'action
    function desactiverBoutonsAction()
    {
        btnHit.disabled = true;
        btnStand.disabled = true;
        btnDouble.disabled = true;
    }

    class Carte
    {
        constructor(valeur, couleur)
        {
            this.valeurBase = valeur;   // permet de récupérer si on avait une dame, un valet ou un roi pour afficher le bon élément dans afficherMain()
            switch(valeur)
            {
                case "A":
                    this.valeur = null;
                    break;
                case "J":
                case "Q":
                case "K":
                    this.valeur = 10;
                    break;
                default :
                    this.valeur = parseInt(valeur, 10);
                
            }

            this.couleur = couleur;
        }

        getValeurBase()
        {
            return this.valeurBase;
        }

        getValeur()
        {
            return this.valeur;
        }
    }   // exemple d'appel : Cartes("3", "coeur")   // avec comme coleures : carreaux, pic, coeur, trefle

    class Main
    {
        constructor()
        {
            this.cartes = [];
            this.mise = 0;
        }

        getScore()
        {
            let score = 0;
            let nbAs = 0;

            this.cartes.forEach((carte) =>
            {
                if (carte.getValeur() === null)
                {
                    nbAs++;
                    score += 11; 
                }
                else
                {
                    score += carte.getValeur();
                }
            });

            while (score > 21 && nbAs > 0)
            {
                score -= 10; 
                nbAs--;
            }

            return score;
        }

        reset()
        {
            this.cartes = [];
            this.mise = 0;
        }
    }

    class Deck
    {
        constructor()
        {
            this.cartes = [];
            this.remplirDeck();
            this.melanger();
        }

        remplirDeck()
        {
            for (let i = 2; i<=10; i++)
            {
                this.cartes.push(new Carte(i.toString(), "pic"));
                this.cartes.push(new Carte(i.toString(), "coeur"));
                this.cartes.push(new Carte(i.toString(), "trefle"));
                this.cartes.push(new Carte(i.toString(), "carreaux"));
            }

            this.cartes.push(new Carte("A", "pic"));
            this.cartes.push(new Carte("A", "coeur"));
            this.cartes.push(new Carte("A", "trefle"));
            this.cartes.push(new Carte("A", "carreaux"));

            this.cartes.push(new Carte("K", "pic"));
            this.cartes.push(new Carte("K", "coeur"));
            this.cartes.push(new Carte("K", "trefle"));
            this.cartes.push(new Carte("K", "carreaux"));

            this.cartes.push(new Carte("Q", "pic"));
            this.cartes.push(new Carte("Q", "coeur"));
            this.cartes.push(new Carte("Q", "trefle"));
            this.cartes.push(new Carte("Q", "carreaux"));

            this.cartes.push(new Carte("J", "pic"));
            this.cartes.push(new Carte("J", "coeur"));
            this.cartes.push(new Carte("J", "trefle"));
            this.cartes.push(new Carte("J", "carreaux"));
        }

        melanger()
        {
            for (let i = this.cartes.length - 1; i > 0; i--)
            {
                let j = Math.floor(Math.random() * (i + 1));
                [this.cartes[i], this.cartes[j]] = [this.cartes[j], this.cartes[i]];
            }
        }

        piocher()
        {
            return this.cartes.pop();
        }

        reset()
        {
            this.cartes = [];
            this.remplirDeck();
            this.melanger();
        }
    }

    class SpectateurError extends Error
    {
        constructor(message)
        {
            super(message);
            this.name = "SpectateurError";
        }
    }

    class ArgentInsuffisant extends Error
    {
        constructor(message)
        {
            super(message);
            this.name = "ArgentInsuffisant";
        }
    }

     class Joueur
    {
        constructor(argentInit, salon)
        {
            this.main = new Main();
            this.argent = argentInit;
            this.mise = 0;
            this.salon = salon;
            this.aDouble = false;
            this.enJeu = true;      // savoir si c'est au joueur de jouer
            this.aBust = false;
            this.estJoueur = true;  // savoir si on a un joueur ou un spectateur, ptt inutile
            btnQuitter.addEventListener("click", this.quitterSalon.bind(this));
        }

        miser(mise)
        {
            if (!this.estJoueur) throw new SpectateurError("Vous êtes un spectateur");

            if (mise <= this.argent)
            {
                this.argent -= mise;
                this.mise = mise;
            }
            else throw new ArgentInsuffisant(`Vous n'avez pas assez d'argent pour miser : ${mise} jetons.`);
        }

        ajouterCarte(carte)
        {
            if (!this.estJoueur) return;
            this.main.cartes.push(carte);
        }

        // CORRECTION: Ajout de la vérification de tour terminé et désactivation des boutons
        choixHit()
        {
            this.aDouble = false;
            this.salon.croupier.distribuerUneCarte(this);
            let score = this.main.getScore();       // sûrement pas optimisé, on recalcule tt le score de la main à chaque hit mais pas grave. On pourait ajouter au score du joueur la carte qu'il vient de tirer.
            
            if (score > 21)
            {
                setTimeout( () =>
                {
                    alert("Vous avez bust :(");
                    this.aBust = true;
                    this.enJeu = false;
                    desactiverBoutonsAction(); // CORRECTION: Désactive les boutons après bust
                    this.salon.terminerTour(); // CORRECTION: Termine le tour après bust
                }, 1000);
               
            }
            else if (score === 21)
            {
                 setTimeout( () =>
                {
                    alert("Black Jack !!");
                    this.enJeu = false;
                    desactiverBoutonsAction(); // CORRECTION: Désactive les boutons après 21
                    this.salon.terminerTour(); // CORRECTION: Termine le tour après 21
                }, 1000);
            }
           
        }

        // CORRECTION: Ajout de la vérification de tour terminé
        choixStand()
        {
            this.aDouble = false;
            this.enJeu = false;
            desactiverBoutonsAction(); // CORRECTION: Désactive les boutons après stand
            this.salon.terminerTour(); // CORRECTION: Termine le tour après stand
        }

        // CORRECTION: Ajout de la vérification de tour terminé
        choixDouble()
        {
            try
            {
                this.miser(this.mise);
                this.choixHit();
                this.enJeu = false;
                this.aDouble = true;
                if (!this.aBust) // Si pas bust après le hit du double
                {
                    desactiverBoutonsAction();
                    this.salon.terminerTour();
                }
            }
            catch(err)
            {
                if (err instanceof ArgentInsuffisant)
                    alert(`Vous ne pouvez pas doubler car : ${err.message}`);
            }
        }

        quitterSalon()
        {
            this.salon.retirerJoueur(this);
            window.location.href = "index.php";
        }

        setEstJoueur(booleen)
        {
            this.estJoueur = booleen;
        }

        // CORRECTION: Ajout d'une méthode reset pour nettoyer entre les tours
        reset()
        {
            this.main.reset();
            this.aBust = false;
            this.enJeu = true;
            this.mise = 0;
        }
    }

    class Salon
    {
        constructor(idSalon, nbPlacesJoueurs)       // récupérer idSalon et nbPlacesJoueurs de la base de données. 
        {
            this.idSalon = idSalon;
            this.nbPlacesJoueurs = nbPlacesJoueurs;
            this.joueurs = [];
            this.spectateurs = [];
            this.deck = new Deck();
            this.croupier = new Croupier(this.deck);
        }

        ajouterJoueur(joueur)
        {
            if (this.joueurs.length < this.nbPlacesJoueurs)
            {
                joueur.setEstJoueur(true);
                this.joueurs.push(joueur);
            }
            else 
            {
                joueur.setEstJoueur(false);
                this.spectateurs.push(joueur);
            }
        }

        retirerJoueur(joueur)
        {
            this.joueurs = this.joueurs.filter(j => j !== joueur);
        }

        // CORRECTION: Ajout de la méthode terminerTour pour gérer la fin du tour
        terminerTour()
        {
            // Le croupier tire ses cartes avec délais
            this.croupier.tirerCartes(() => {
                // Callback appelé quand le croupier a fini de tirer
                setTimeout(() => {
                    this.resultatTour();
                    btnLancerTour.disabled = false;
                }, 1000); // Délai supplémentaire avant d'afficher les résultats
            });
        }
        // CORRECTION: Déplacement et correction de la méthode resultatTour
        resultatTour()
        {
            const scoreCroupier = this.croupier.main.getScore();
            const croupierBust = this.croupier.aBust;

            this.joueurs.forEach((joueur) =>      // On vérifie le résultat pour chaque joueur du salon
            {
                const scoreJoueur = joueur.main.getScore();
                const joueurBust = joueur.aBust;

                if (joueurBust || (!croupierBust && scoreJoueur < scoreCroupier)) // perdu
                {
                    alert("Dommage ! vous perdez ce tour.");
                }
                else if (!joueurBust && (croupierBust || scoreCroupier < scoreJoueur)) // gagné
                {
                    if (! joueur.aDouble)
                    {
                        joueur.argent += 2 * joueur.mise;
                        alert("Yes ! Vous remportez ce tour.");
                    }
                    else if (joueur.aDouble)
                    {
                        joueur.argent += 4 * joueur.mise;
                        alert("HOURA !! Vous remportez un tour doublé !");
                    }
                    
                }
                else if (!joueurBust && (scoreCroupier === scoreJoueur)) // égalité
                {
                    joueur.argent += joueur.mise;
                    alert("De justesse ! Vous faites égalité avec le croupier.");
                }
                
                afficherArgent(joueur); // Met à jour l'affichage de l'argent
            });
        }

        // CORRECTION: Ajout d'une méthode pour reset le salon entre les tours
        resetTour()
        {
            this.deck.reset();
            this.croupier.reset();
            this.joueurs.forEach(joueur => {
                joueur.reset();
                if (joueur.argent <= 0)
                {
                    alert("Oh mince, vous n'avez plus de jetons.");
                    joueur.quitterSalon();
                }
            });
        }
    }

    class Croupier
    {
        constructor(deck)
        {
            this.main = new Main();
            this.score = 0;
            this.deck = deck;
            this.aBust = false;
        }

        tirerUneCarte()
        {
            this.main.cartes.push(this.deck.piocher()); // CORRECTION: Utilise directement main.cartes au lieu d'une méthode inexistante
            this.score = this.main.getScore();
            afficherMain(this, "croupier");
        }

        distribuerUneCarte(joueur)
        {
            joueur.ajouterCarte(this.deck.piocher());
            afficherMain(joueur, "joueur");
        }

        scoreCroupier()
        {
            this.score = this.main.getScore();       // sûrement pas optimisé, recalcule tt le score de la main à chaque hit mais pas grave. On pourait ajouter au score du joueur la carte qu'il vient de tirer.
            if (this.score > 21)
            {
                alert("Le croupier à bust :)");
                this.aBust = true;
            }
            else if (this.score === 21)
            {
                alert("Black Jack pour le croupier !");
            }
        }

        tirerCartes(attendre)
        {
            const tirerProchaineCarte = () => {
                if (this.main.getScore() < 17)
                {
                    this.tirerUneCarte();
                    
                    // Vérifie le score après avoir tiré
                    if (this.main.getScore() > 21)
                    {
                        this.aBust = true;
                        setTimeout(() => {
                            alert("Le croupier a bust :)");
                            attendre(); // Termine quand bust
                        }, 1000);
                        return;
                    }
                    else if (this.main.getScore() === 21)
                    {
                        setTimeout(() => {
                            alert("Black Jack pour le croupier !");
                            attendre(); // Termine à 21
                        }, 1000);
                        return;
                    }
                    
                    
                    setTimeout(tirerProchaineCarte, 1000);      // permet d'avoir une seconde de delais enntre chaque carte que le croupier tire pour le suspens
                }
                else
                {
                    // Le croupier a fini de tirer 
                    attendre();
                }
            };
            
            // Commence à tirer
            tirerProchaineCarte();
        }

        // CORRECTION: Ajout d'une méthode reset pour nettoyer entre les tours
        reset()
        {
            this.main.reset();
            this.score = 0;
            this.aBust = false;
        }
    }

    // CORRECTION: Suppression des fonctions redondantes et simplification

    class Menu
    {
        constructor()
        {
            this.salons = [];
        }
    }

    // Instanciation
    const menu   = new Menu();
    const salon1 = new Salon("salon1", 1);
    menu.salons.push(salon1);

    const joueur1 = new Joueur(1000, salon1);
    salon1.ajouterJoueur(joueur1);
    afficherArgent(joueur1);

    // État initial boutons
    btnHit.disabled    = true;
    btnStand.disabled  = true;
    btnDouble.disabled = true;

    // Listeners CORRECTION : Miser avant de pouvoir jouer
    btnMise.addEventListener("click", () =>
    {
        try
        {
            // Miser d'abord
            joueur1.miser(parseInt(miseVoulue.value, 10));
            afficherArgent(joueur1);

            // Désactiver le bouton miser et lancer la partie
            btnMise.disabled   = true;
            btnLancerTour.disabled = true;
            
            // Distribution des cartes - 1 carte visible pour le croupier
            salon1.croupier.tirerUneCarte();
            
            // Distribution de 2 cartes pour le joueur
            salon1.croupier.distribuerUneCarte(joueur1);
            salon1.croupier.distribuerUneCarte(joueur1);
            
            // Afficher les mains
            afficherMain(salon1.croupier, "croupier");
            afficherMain(joueur1, "joueur");

            // Activer les boutons d'action
            btnHit.disabled    = false;
            btnStand.disabled  = false;
            btnDouble.disabled = false;
        }
        catch (e)
        {
            if (e instanceof ArgentInsuffisant)
                alert(e.message);
        }
    });


    btnHit.addEventListener("click", () =>
    {
        joueur1.choixHit();
        afficherMain(joueur1, "joueur");
    });

    btnStand.addEventListener("click", () =>
    {
        joueur1.choixStand();
    });

    btnDouble.addEventListener("click", () =>
    {
        try
        {
            joueur1.choixDouble();
            afficherMain(joueur1, "joueur");
            afficherArgent(joueur1);
        }
        catch (e)
        {
            if (e instanceof ArgentInsuffisant)
                alert(e.message);
        }
    });

   
    btnLancerTour.addEventListener("click", () =>
    {
        // Reset du salon pour le nouveau tour
        salon1.resetTour();
        
        // Réactive le bouton miser pour un nouveau tour
        btnMise.disabled = false;
        btnLancerTour.disabled = true;
        
        // Remet à zéro l'affichage
        afficherMain(salon1.croupier, "croupier");
        afficherMain(joueur1, "joueur");
    });

    btnQuitter.addEventListener("click", () => 
    {
        joueur1.quitterSalon();
        
    });

    
});
