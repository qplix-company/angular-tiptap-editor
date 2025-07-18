# TiptapEditor - Projet Angular

Ce projet contient une **bibliothèque Angular** d'éditeur de texte riche basée sur Tiptap, ainsi qu'une **démo interactive** pour tester toutes les fonctionnalités.

## 📁 Structure du projet

```
project/
├── projects/tiptap-editor/     # 📦 Bibliothèque principale
│   ├── src/lib/               # Code source de la lib
│   ├── package.json           # Configuration npm de la lib
│   └── README.md              # Documentation de la lib
├── src/                       # 🎮 Application de démo
│   ├── components/            # Composants de la démo
│   ├── services/              # Services de la démo
│   └── main.ts               # Point d'entrée de la démo
└── README.md                 # Ce fichier
```

## 🚀 Démarrage rapide

### Installation des dépendances

```bash
npm install
```

### Lancer la démo

```bash
npm start
```

La démo sera accessible sur `http://localhost:4200`

### Build de la bibliothèque

```bash
npm run build:lib
```

### Build de la démo

```bash
npm run build
```

## 📦 À propos de la bibliothèque

**TiptapEditor** est un éditeur de texte riche moderne et personnalisable pour Angular, basé sur Tiptap avec support complet de l'internationalisation.

### ✨ Fonctionnalités principales

- 🌍 **Internationalisation** (Français/Anglais) avec détection automatique
- 🎛️ **Toolbar personnalisable** avec tous les outils de formatage
- 💬 **Menus contextuels** (bubble menus) pour texte et images
- ⚡ **Slash commands** avec interface intuitive
- 📸 **Upload d'images** avec drag & drop et redimensionnement
- 📱 **Responsive** et accessible
- 🎨 **Styles modernes** et personnalisables

### 📚 Documentation complète

Consultez la [documentation de la bibliothèque](./projects/tiptap-editor/README.md) pour :

- Guide d'installation et d'utilisation
- Configuration détaillée
- Exemples de code
- API complète

## 🎮 Démo interactive

La démo inclut :

- **Panneau de configuration** pour tester tous les paramètres
- **Générateur de code** pour voir le code Angular généré
- **Interface multilingue** (FR/EN)
- **Tests de toutes les fonctionnalités** en temps réel

## 🛠️ Scripts disponibles

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm start`         | Lance la démo en mode développement            |
| `npm run build`     | Build la démo                                  |
| `npm run build:lib` | Build la bibliothèque                          |
| `npm run watch:lib` | Build la lib en mode watch                     |
| `npm run dev`       | Mode développement avec watch de la lib + démo |
| `npm run ng`        | Accès direct à Angular CLI                     |

## 📦 Publication

### Publier la bibliothèque

```bash
# Build la lib
npm run build:lib

# Aller dans le dossier dist
cd dist/tiptap-editor

# Publier sur npm
npm publish
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- Signaler des bugs
- Proposer des améliorations
- Ajouter de nouvelles fonctionnalités
- Améliorer la documentation

## 📄 Licence

MIT License - voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 🔗 Liens utiles

- [Documentation de la bibliothèque](./projects/tiptap-editor/README.md)
- [Documentation Tiptap](https://tiptap.dev/)
- [Angular](https://angular.dev/)
- [Angular CLI](https://angular.dev/tools/cli)
