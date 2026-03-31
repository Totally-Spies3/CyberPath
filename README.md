# 3D-game-BABYLON-JS

## Comment recuperer le projet et installer les dépendances ???? TUTO
<img width="218" height="232" alt="image" src="https://github.com/user-attachments/assets/d7547674-d95e-4ea5-adc5-8c061f7dab42"  hspace="50" />
<img width="218" height="232" alt="image" src="https://github.com/user-attachments/assets/ace7631f-77be-4c0d-bddf-44d046dfda9c" />


### Prérequis 
- Installer Node.js (version 18 ou + recommandé) : https://nodejs.org/
- **Avoir npm** (installé avec Node) ++++ 

### cloner le projet sur VScode
```powershell
https://github.com/Totally-Spies3/CyberPath.git
```

### Installer les dépendances 
```powershell
npm install 
```
### Builder le projet 
```powershell
npm run build 
```

### Lancer le projet localement 
```powershell
npm run start 
```
> Normalement lorsque cette commande est lancée , les modifications du projet s'affiche automatiquement sur l'écran.   
> **Ctrl + C** : arreter le "serveur" local 

### Commentaire
les instructions en dessous correspond a la documentation de comment j'ai créer le projet de 0 avec explication . lisez le une fois pour comprendre les differents fichier de config et respecter la structure de base d'un projet babylon js 


<br><br><br><br><br><br><br><br><br><br>



## I - Configuration du projet 
### 1 - Creation du projet 

#### **ETAPE 1 :**  
Créer les 3 dossiers suivants :  
- **dist** :   
    - **But** : La version du code deployé/Hébergé sur internet. Son contenu généré automatiquement à partir des dossiers **src** et **public**
- **public** :   
    - **But** : stocker tout les medias et assets.   
    - **Contient** :  
        - Images et textures  
        - Sons et musiques  
        - Modèles 3D (.gltf, .obj, etc)   
        - Fichiers statiques (HTML , CSS de base)  
- **src** :  
    - **But** : code source principal   
    - **Contient** :  
        - fichiers Typescript / JavaScript  
        - scene babylon js  
        - classe et composant   
        - ... ect   

#### **ETAPE 2 :**  
Dans le dossier **src**, créer le fichier **app.ts** : 
>Cerveau du jeu / metteur en scène qui controle tout. 

Dans le dossier **public**, créer le fichier **index.html** :  
>Point d'entrée du navigateur : on affiche le jeu 3D dans ce fichier / scène ou tout s'affiche.   

### 2 - Installation de Babylon js 

#### 2.1 - Generer le package.json 
```powershell
npm init
```

> **1 - Qu'est-ce que package.json ?**   
>**package.json** est le fichier de configuration essentiel de tout projet.   
>C'est comme la carte d'identité + manuel d'instructions d'un projet.
> 
> **2 -  À quoi il sert vraiment ?**   
> - **Identification du projet :** nom , version , description , auteur ...ect   
> - **Gestion des dépendances :** Liste toutes les bibliothèques nécessaires   
> - **Automatisation des tâches :** définit des commandes rapides pour lancer un projet , builder un projet ...ect 
> 
> **3 -  Pourquoi c'est indispensable ?**   
> - **Sans package.json :**  
>   - Gestion de version chaotique
>   - Difficile d'installer les dépendances qu'il faut
>   - Pas de scripts automatiques DONC ecrire toute les commandes soit meme   
> - **Avec package.json :**  
>   - `npm install` installe tout automatiquement
>   - `npm run dev` lance le serveur de développement
>   -  Gestion propre des versions

#### 2.2 - Installation des dependances de babylon js
```powershell
npm install --save-dev @babylonjs/core
```
```powershell
npm install --save-dev @babylonjs/inspector
```

#### 2.3 - Installation de tsconfig 
```powershell
tsc --init
```
> **tsconfig.json** est le "mode d'emploi" qui explique à TypeScript comment transformer ton code TypeScript en JavaScript


### 3 - Configuration de webpack 
**Webpack** est un "assembleur" qui prend tous tes fichiers et les transforme en quelques fichiers optimisés pour le web.   
c'est lui qui "genere" le contenu de dist qui sera par la suite deployé sur internet 


#### 3.1 - Installation des dependances 
```powershell
npm install --save-dev typescript webpack ts-loader webpack-cli
```

#### 3.2 - Configuration 

[Instructions en attendant du reste de la config car flemme ](https://doc.babylonjs.com/guidedLearning/createAGame/gettingSetUp/)

### 4 comment lancer l'application en local 
```powershell
npm run build
```

```powershell
npm run start
```

> Inspector : SHIFT + CTRL + ALT + I 




