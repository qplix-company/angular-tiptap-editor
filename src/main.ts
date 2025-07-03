import { Component, signal } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
  TiptapEditorComponent,
  ToolbarConfig,
  BubbleMenuConfig,
} from "tiptap-editor";
import { MAT_ICON_DEFAULT_OPTIONS } from "@angular/material/icon";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TiptapEditorComponent,
  ],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h1>🖋️ Angular 19 Tiptap Editor</h1>
        <p>
          Un wrapper Angular moderne avec Material Icons, toolbar configurable,
          bubble menu, slash commands et support Office + Images
        </p>
      </div>

      <!-- Slash Commands Demo -->
      <div class="demo-section">
        <h2>⚡ Slash Commands avec Menu Filtrable</h2>
        <p>Tapez <code>/</code> pour ouvrir le menu des commandes rapides :</p>
        <tiptap-editor
          [content]="slashCommandsContent()"
          [enableSlashCommands]="true"
          [toolbar]="{
            bold: true,
            italic: true,
            image: true,
            undo: true,
            redo: true,
            separator: false
          }"
          placeholder="Tapez / pour voir les commandes disponibles..."
          (contentChange)="onSlashCommandsContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #e6f3ff; border-radius: 4px; font-size: 14px;"
        >
          <strong>💡 Nouvelles fonctionnalités Slash Commands:</strong>
          <br />• Tapez <strong>/</strong> pour ouvrir le menu avec toutes les
          commandes <br />• Continuez à taper pour filtrer (ex:
          <strong>/titre</strong>, <strong>/liste</strong>,
          <strong>/image</strong>) <br />• Utilisez les flèches ↑↓ pour naviguer
          et Entrée pour sélectionner <br />• Échap pour fermer le menu <br />•
          Icônes Material Design pour chaque commande
        </div>
      </div>

      <!-- Toolbar Complète -->
      <div class="demo-section">
        <h2>🔧 Toolbar Complète - Toutes les Fonctionnalités</h2>
        <p>
          Découvrez toutes les fonctionnalités disponibles dans la toolbar avec
          les nouvelles extensions :
        </p>
        <tiptap-editor
          [content]="fullToolbarContent()"
          [toolbar]="{
            bold: true,
            italic: true,
            underline: true,
            strike: true,
            code: true,
            superscript: true,
            subscript: true,
            highlight: true,
            heading1: true,
            heading2: true,
            heading3: true,
            bulletList: true,
            orderedList: true,
            blockquote: true,
            alignLeft: true,
            alignCenter: true,
            alignRight: true,
            alignJustify: true,
            link: true,
            image: true,
            horizontalRule: true,
            undo: true,
            redo: true,
            separator: true
          }"
          placeholder="Testez toutes les fonctionnalités de formatage..."
          (contentChange)="onFullToolbarContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #e6f3ff; border-radius: 4px; font-size: 14px;"
        >
          <strong>✨ Toutes les fonctionnalités :</strong>
          <br />• <strong>Formatage :</strong> Gras, Italique, Souligné, Barré,
          Code, Exposant, Indice, Surbrillance <br />•
          <strong>Structure :</strong> Titres H1/H2/H3, Listes, Citations, Ligne
          horizontale <br />• <strong>Alignement :</strong> Gauche, Centre,
          Droite, Justifié <br />• <strong>Contenu :</strong> Liens, Images avec
          menu contextuel <br />• <strong>Actions :</strong> Annuler, Refaire
        </div>
      </div>

      <!-- Basic Editor -->
      <div class="demo-section">
        <h2>✨ Éditeur de Base Simplifié</h2>
        <p>Un éditeur simple avec les fonctionnalités essentielles :</p>
        <tiptap-editor
          [content]="basicContent()"
          [toolbar]="{
            bold: true,
            italic: true,
            underline: true,
            heading1: true,
            heading2: true,
            bulletList: true,
            orderedList: true,
            link: true,
            image: true,
            undo: true,
            redo: true,
            separator: true
          }"
          placeholder="Commencez à écrire..."
          (contentChange)="onBasicContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #e6f3ff; border-radius: 4px; font-size: 14px;"
        >
          <strong>💡 Astuce:</strong> Sélectionnez du texte pour voir apparaître
          le bubble menu flottant ! Utilisez les slash commands avec
          <strong>/</strong>
          pour insérer rapidement des éléments structurels.
        </div>
      </div>

      <!-- Image Demo -->
      <div class="demo-section">
        <h2>📷 Gestion des Images avec Menu Contextuel</h2>
        <p>Testez l'ajout d'images et leur menu contextuel :</p>
        <tiptap-editor
          [content]="imageContent()"
          [toolbar]="{ bold: true, italic: true, image: true, separator: true }"
          placeholder="Cliquez sur l'icône image pour ajouter une photo..."
          (contentChange)="onImageContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #e6f3ff; border-radius: 4px; font-size: 14px;"
        >
          <strong>💡 Nouvelles fonctionnalités images:</strong>
          <br />• Cliquez sur une image pour voir le menu contextuel avec les
          icônes Material <br />• <strong>Changer l'image</strong> : Remplacer
          par un nouveau fichier <br />• <strong>Modifier l'URL</strong> :
          Changer l'URL de l'image <br />• <strong>Supprimer</strong> :
          Supprimer l'image avec confirmation <br />• Utilisez des URLs comme :
          https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400
        </div>
      </div>

      <!-- Bubble Menu Configuration Demo -->
      <div class="demo-section">
        <h2>🎈 Configuration du Bubble Menu</h2>
        <p>
          Personnalisez le menu flottant qui apparaît lors de la sélection :
        </p>

        <div class="config-buttons">
          <button class="config-button" (click)="setBubbleMenuMinimal()">
            Bubble Menu Minimal
          </button>
          <button class="config-button" (click)="setBubbleMenuComplete()">
            Bubble Menu Complet
          </button>
          <button class="config-button secondary" (click)="disableBubbleMenu()">
            Désactiver Bubble Menu
          </button>
          <button class="config-button secondary" (click)="enableBubbleMenu()">
            Réactiver Bubble Menu
          </button>
        </div>

        <div class="toolbar-config-example">
          <pre>
Bubble Menu activé: {{ showBubbleMenuDemo() }}
Configuration: {{ JSON.stringify(currentBubbleMenuConfig(), null, 2) }}
          </pre
          >
        </div>

        <tiptap-editor
          [content]="bubbleMenuDemoContent()"
          [showBubbleMenu]="showBubbleMenuDemo()"
          [bubbleMenu]="currentBubbleMenuConfig()"
          [toolbar]="{
            bold: true,
            italic: true,
            strike: true,
            image: true,
            separator: false
          }"
          placeholder="Sélectionnez du texte pour tester le bubble menu avec Material Icons..."
          (contentChange)="onBubbleMenuDemoContentChange($event)"
        >
        </tiptap-editor>
      </div>

      <!-- Toolbar Configuration Demo -->
      <div class="demo-section">
        <h2>🔧 Configuration de la Toolbar</h2>
        <p>
          Personnalisez facilement les éléments de la toolbar avec des icônes
          Material :
        </p>

        <div class="config-buttons">
          <button class="config-button" (click)="setMinimalToolbar()">
            Toolbar Minimale
          </button>
          <button class="config-button" (click)="setWritingToolbar()">
            Toolbar Écriture
          </button>
          <button class="config-button" (click)="setImageToolbar()">
            Toolbar avec Images
          </button>
          <button class="config-button" (click)="setFullToolbar()">
            Toolbar Complète
          </button>
          <button class="config-button" (click)="setSuperToolbar()">
            Toolbar SUPER Complète
          </button>
          <button class="config-button secondary" (click)="setCustomToolbar()">
            Configuration Custom
          </button>
        </div>

        <div class="toolbar-config-example">
          <pre>
Configuration actuelle: {{ JSON.stringify(currentToolbarConfig(), null, 2) }}
          </pre
          >
        </div>

        <tiptap-editor
          [content]="toolbarDemoContent()"
          [toolbar]="currentToolbarConfig()"
          placeholder="Testez la configuration de toolbar avec Material Icons..."
          (contentChange)="onToolbarDemoContentChange($event)"
        >
        </tiptap-editor>
      </div>

      <!-- Guide d'utilisation -->
      <div class="demo-section">
        <h2>📋 Guide d'Utilisation Rapide</h2>
        <p>
          Les principales configurations pour utiliser l'éditeur dans vos
          projets :
        </p>

        <div
          style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin: 16px 0;"
        >
          <h4 style="margin-top: 0;">🚀 Import requis :</h4>
          <div
            style="background: #2d3748; color: #e2e8f0; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px;"
          >
            import {{ "{" }} TiptapEditorComponent {{ "}" }} from
            'tiptap-editor';
          </div>

          <h4>✨ Configuration de base :</h4>
          <p
            style="font-family: monospace; font-size: 14px; background: #e6f3ff; padding: 8px; border-radius: 4px;"
          >
            bold, italic, underline, heading1, heading2, bulletList,
            orderedList, link, image, undo, redo
          </p>

          <h4>🔧 Configuration complète :</h4>
          <p
            style="font-family: monospace; font-size: 12px; background: #e6f3ff; padding: 8px; border-radius: 4px;"
          >
            bold, italic, underline, strike, code, superscript, subscript,
            highlight, heading1-3, bulletList, orderedList, blockquote,
            alignLeft/Center/Right/Justify, link, image, horizontalRule, undo,
            redo
          </p>

          <h4>🎈 Bubble Menu recommandé :</h4>
          <p
            style="font-family: monospace; font-size: 14px; background: #e6f3ff; padding: 8px; border-radius: 4px;"
          >
            bold, italic, underline, strike, code, highlight, link
          </p>
        </div>
      </div>

      <!-- Office Paste Demo -->
      <div class="demo-section">
        <h2>📋 Support Copier-Coller Office</h2>
        <p>Testez le copier-coller depuis Word, Excel ou PowerPoint :</p>
        <tiptap-editor
          [content]="officePasteContent()"
          [enableOfficePaste]="true"
          placeholder="Copiez du contenu depuis Word, Excel ou PowerPoint et collez-le ici..."
          (contentChange)="onOfficePasteContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #e6f3ff; border-radius: 4px; font-size: 14px;"
        >
          <strong>💡 Astuce:</strong> Ouvrez un document Word/Excel/PowerPoint,
          copiez du contenu formaté et collez-le dans l'éditeur ci-dessus. Le
          formatage sera préservé !
        </div>
      </div>

      <!-- Advanced Editor with Forms -->
      <div class="demo-section">
        <h2>📝 Intégration avec les Forms Angular</h2>
        <p>Utilisation avec FormControl et validation :</p>
        <tiptap-editor
          [formControl]="editorFormControl"
          [toolbar]="{
            bold: true,
            italic: true,
            image: true,
            undo: true,
            redo: true,
            separator: false
          }"
          [bubbleMenu]="{ bold: true, italic: true, separator: false }"
          placeholder="Éditeur avec FormControl..."
        >
        </tiptap-editor>
        <div style="margin-top: 12px; font-size: 14px; color: #718096;">
          <strong>Valeur du FormControl:</strong>
          {{ editorFormControl.value || "Vide" }}
        </div>
      </div>

      <!-- Minimal Editor -->
      <div class="demo-section">
        <h2>🎯 Éditeur Minimal</h2>
        <p>Sans toolbar ni compteur de caractères, mais avec bubble menu :</p>
        <tiptap-editor
          [content]="minimalContent()"
          [showToolbar]="false"
          [showCharacterCount]="false"
          [bubbleMenu]="{
            bold: true,
            italic: true,
            code: true,
            separator: false
          }"
          placeholder="Éditeur minimaliste avec bubble menu Material Icons..."
          (contentChange)="onMinimalContentChange($event)"
        >
        </tiptap-editor>
      </div>

      <!-- Read-only Editor -->
      <div class="demo-section">
        <h2>👁️ Mode Lecture Seule</h2>
        <p>Affichage du contenu sans possibilité d'édition :</p>
        <tiptap-editor
          [content]="readonlyContent()"
          [editable]="false"
          [showToolbar]="false"
          [showBubbleMenu]="false"
        >
        </tiptap-editor>
      </div>

      <!-- Character Count Editor -->
      <div class="demo-section">
        <h2>🔢 Avec Limite de Caractères</h2>
        <p>Éditeur avec comptage et limite de caractères :</p>
        <tiptap-editor
          [content]="countContent()"
          [maxCharacters]="200"
          [toolbar]="{ bold: true, italic: true, code: true, separator: false }"
          [bubbleMenu]="{ bold: true, italic: true, separator: false }"
          placeholder="Maximum 200 caractères..."
          (contentChange)="onCountContentChange($event)"
        >
        </tiptap-editor>
      </div>

      <!-- Events Demo -->
      <div class="demo-section">
        <h2>⚡ Événements de l'Éditeur</h2>
        <p>Démonstration des événements focus/blur :</p>
        <tiptap-editor
          [content]="eventsContent()"
          [toolbar]="{
            bold: true,
            italic: true,
            strike: true,
            image: true,
            undo: true,
            redo: true
          }"
          placeholder="Testez les événements..."
          (editorFocus)="onEditorFocus()"
          (editorBlur)="onEditorBlur()"
          (contentChange)="onEventsContentChange($event)"
        >
        </tiptap-editor>
        <div
          style="margin-top: 12px; padding: 8px; background: #f8f9fa; border-radius: 4px; font-size: 14px;"
        >
          <strong>État:</strong> {{ editorState() }}
        </div>
      </div>

      <!-- New Angular 19 Features Demo -->
      <div class="demo-section">
        <h2>🚀 Nouvelles Fonctionnalités Angular 19</h2>
        <p>Démonstration des signals et control flow :</p>

        @if (showAdvancedEditor()) {
        <tiptap-editor
          [content]="advancedContent()"
          [toolbar]="{
            heading1: true,
            heading2: true,
            bulletList: true,
            orderedList: true,
            blockquote: true,
            image: true
          }"
          [bubbleMenu]="{ bold: true, italic: true, strike: true, code: true }"
          placeholder="Éditeur avec signals..."
          (contentChange)="onAdvancedContentChange($event)"
        >
        </tiptap-editor>
        } @else {
        <div
          style="padding: 20px; text-align: center; background: #f8f9fa; border-radius: 8px;"
        >
          <p>Cliquez sur le bouton pour afficher l'éditeur avancé</p>
        </div>
        }

        <button
          (click)="toggleAdvancedEditor()"
          style="margin-top: 12px; padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          {{ showAdvancedEditor() ? "Masquer" : "Afficher" }} l'éditeur avancé
        </button>
      </div>

      <!-- Material Icons Showcase -->
      <div class="demo-section">
        <h2>🎨 Showcase des Icônes Material</h2>
        <p>Voici les icônes Material utilisées dans l'éditeur :</p>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;"
        >
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_bold</span
            >
            <span>format_bold (Gras)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_italic</span
            >
            <span>format_italic (Italique)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >strikethrough_s</span
            >
            <span>strikethrough_s (Barré)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">code</span>
            <span>code (Code)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">image</span>
            <span>image (Image)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">edit</span>
            <span>edit (Modifier image)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">link</span>
            <span>link (URL image)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #c53030;">delete</span>
            <span>delete (Supprimer image)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_list_bulleted</span
            >
            <span>format_list_bulleted (Liste)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_list_numbered</span
            >
            <span>format_list_numbered (Liste numérotée)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_quote</span
            >
            <span>format_quote (Citation)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">undo</span>
            <span>undo (Annuler)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;">redo</span>
            <span>redo (Refaire)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_h1</span
            >
            <span>format_h1 (Titre 1)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_h2</span
            >
            <span>format_h2 (Titre 2)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >format_h3</span
            >
            <span>format_h3 (Titre 3)</span>
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px;"
          >
            <span class="material-icons" style="color: #3182ce;"
              >horizontal_rule</span
            >
            <span>horizontal_rule (Ligne)</span>
          </div>
        </div>
      </div>

      <!-- Documentation Section -->
      <div class="demo-section">
        <h2>📚 Exemples de Configuration</h2>
        <p>
          Voici quelques exemples de configurations de toolbar, bubble menu et
          slash commands :
        </p>

        <div class="toolbar-config-example">
          <pre>
// Toolbar minimale (seulement formatage de base)
[toolbar]="&#123; bold: true, italic: true, separator: false &#125;"

// Toolbar pour l'écriture avec images
[toolbar]="&#123; 
  bold: true, 
  italic: true, 
  strike: true,
  heading1: true, 
  heading2: true, 
  blockquote: true,
  image: true,
  undo: true, 
  redo: true 
&#125;"

// Toolbar complète (tous les éléments)
[toolbar]="&#123; 
  bold: true, 
  italic: true, 
  strike: true, 
  code: true,
  heading1: true, 
  heading2: true, 
  heading3: true,
  bulletList: true, 
  orderedList: true, 
  blockquote: true,
  image: true,
  undo: true, 
  redo: true,
  separator: true 
&#125;"

// Configuration du Bubble Menu
[bubbleMenu]="&#123; 
  bold: true, 
  italic: true, 
  strike: true, 
  code: true,
  separator: true 
&#125;"

// Slash Commands (activés par défaut)
[enableSlashCommands]="true"
// Tapez / pour voir toutes les commandes disponibles
// Continuez à taper pour filtrer (ex: /titre, /liste, /image)

// Désactiver complètement la toolbar ou le bubble menu
[showToolbar]="false"
[showBubbleMenu]="false"

// Menu contextuel des images (automatique)
// Cliquez sur une image pour voir :
// - Changer l'image (icône edit)
// - Modifier l'URL (icône link)  
// - Supprimer (icône delete)

// Utilisation avec Material Icons
// Les icônes sont automatiquement intégrées :
// - format_bold, format_italic, strikethrough_s
// - code, image, format_list_bulleted, format_list_numbered
// - format_quote, undo, redo
// - edit, link, delete (pour les images)
// - format_h1, format_h2, format_h3, horizontal_rule (slash commands)
          </pre
          >
        </div>
      </div>
    </div>
  `,
})
export class App {
  // Utilisation des signals pour l'état
  basicContent = signal(
    "<p>Bonjour ! Voici un <strong>éditeur Tiptap</strong> intégré dans Angular 19 avec des <em>icônes Material Design</em>. Vous pouvez utiliser la toolbar pour formater le texte, <strong>ajouter des images</strong>, ou <strong>sélectionner du texte</strong> pour voir le bubble menu !</p>"
  );
  minimalContent = signal(
    "<p>Ceci est un éditeur sans toolbar, mais avec bubble menu utilisant des <strong>icônes Material</strong>. <strong>Sélectionnez ce texte</strong> pour le voir !</p>"
  );
  countContent = signal("<p>Testez la limite de caractères ici...</p>");
  eventsContent = signal("<p>Cliquez ici pour tester les événements.</p>");
  advancedContent = signal(
    "<p>Éditeur avec les nouvelles fonctionnalités d'Angular 19 et Material Icons !</p>"
  );
  officePasteContent = signal(
    "<p>Testez le copier-coller depuis Office ici...</p>"
  );
  toolbarDemoContent = signal(
    "<p>Testez les différentes configurations de toolbar avec <strong>Material Icons</strong> !</p>"
  );
  bubbleMenuDemoContent = signal(
    "<p><strong>Sélectionnez ce texte</strong> pour tester le bubble menu avec différentes configurations et des <em>icônes Material</em> ! Ajoutez aussi une image pour tester le menu contextuel.</p>"
  );
  imageContent = signal(
    '<p>Testez l\'ajout d\'images avec l\'icône Material ! 📷</p><p><strong>Cliquez sur l\'image ci-dessous</strong> pour voir le nouveau menu contextuel avec les options de modification :</p><img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" class="tiptap-image" alt="Exemple d\'image - Cliquez pour voir le menu contextuel">'
  );
  slashCommandsContent = signal(
    "<p>Testez les <strong>slash commands</strong> ! Tapez <code>/</code> n'importe où pour voir le menu des commandes avec des icônes Material.</p><p>Exemples à essayer :</p><ul><li>Tapez <strong>/titre</strong> pour filtrer les titres</li><li>Tapez <strong>/liste</strong> pour les listes</li><li>Tapez <strong>/image</strong> pour insérer une image</li></ul>"
  );

  fullToolbarContent = signal(
    `<h2>🔧 Démonstration Toolbar Complète</h2>
    <p>Testez toutes les fonctionnalités de formatage :</p>
    <p><strong>Gras</strong>, <em>Italique</em>, <u>Souligné</u>, <s>Barré</s>, <code>Code</code>, <sup>Exposant</sup>, <sub>Indice</sub>, <mark>Surbrillance</mark></p>
    <h3>Alignements</h3>
    <p>Texte aligné à gauche (par défaut)</p>
    <p style="text-align: center">Texte centré</p>
    <p style="text-align: right">Texte aligné à droite</p>
    <p style="text-align: justify">Texte justifié - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <h3>Listes et Structure</h3>
    <ul>
      <li>Liste à puces</li>
      <li>Avec plusieurs éléments</li>
    </ul>
    <ol>
      <li>Liste numérotée</li>
      <li>Avec ordre</li>
    </ol>
    <blockquote>
      <p>Citation avec style</p>
    </blockquote>
    <hr>
    <p>Ligne horizontale ci-dessus. Testez aussi les <a href="https://tiptap.dev">liens</a> !</p>`
  );

  editorState = signal("Inactif");
  showAdvancedEditor = signal(false);

  // Signal pour la configuration de toolbar actuelle - commencer avec une config minimale
  currentToolbarConfig = signal<Partial<ToolbarConfig>>({
    bold: true,
    italic: true,
    separator: false,
  });

  // Signals pour la configuration du bubble menu
  showBubbleMenuDemo = signal(true);
  currentBubbleMenuConfig = signal<Partial<BubbleMenuConfig>>({
    bold: true,
    italic: true,
    strike: true,
    code: true,
    separator: true,
  });

  // Form control pour l'intégration avancée
  editorFormControl = new FormControl(
    "<p>Contenu géré par FormControl avec Angular 19 et Material Icons</p>"
  );

  // Contenu en lecture seule
  readonlyContent = signal(`
    <h2>Documentation Angular 19 Tiptap avec Material Icons</h2>
    <p>Ce wrapper Angular pour <strong>Tiptap</strong> utilise les nouvelles fonctionnalités d'Angular 19 :</p>
    <ul>
      <li>Nouveaux <strong>input()</strong> et <strong>output()</strong> signals</li>
      <li>Control flow avec <code>@if</code>, <code>@for</code>, <code>@else</code></li>
      <li>Signals pour la gestion d'état réactive</li>
      <li>Effects pour les effets de bord</li>
      <li>viewChild() avec signals</li>
      <li>Computed values pour les états dérivés</li>
      <li><strong>Support amélioré du copier-coller Office</strong> 📋</li>
      <li><strong>Toolbar entièrement configurable</strong> 🔧</li>
      <li><strong>Bubble Menu flottant configurable</strong> 🎈</li>
      <li><strong>Menu contextuel pour les images</strong> 🖼️</li>
      <li><strong>Slash Commands avec filtrage intelligent</strong> ⚡</li>
      <li><strong>Icônes Material Design intégrées</strong> 🎨</li>
      <li><strong>Support des images avec Material Icons</strong> 📷</li>
    </ul>
    <blockquote>
      <p>Un éditeur moderne utilisant les dernières innovations d'Angular 19 avec une compatibilité Office optimale, une toolbar flexible, un bubble menu intuitif, un menu contextuel pour les images, des slash commands intelligents, des icônes Material Design professionnelles et un support complet des images !</p>
    </blockquote>
    <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&h=300&fit=crop" class="tiptap-image" alt="Image de démonstration - Mode lecture seule">
  `);

  // Méthodes pour changer le contenu
  onBasicContentChange(content: string) {
    this.basicContent.set(content);
  }

  onMinimalContentChange(content: string) {
    this.minimalContent.set(content);
  }

  onCountContentChange(content: string) {
    this.countContent.set(content);
  }

  onEventsContentChange(content: string) {
    this.eventsContent.set(content);
  }

  onAdvancedContentChange(content: string) {
    this.advancedContent.set(content);
  }

  onOfficePasteContentChange(content: string) {
    this.officePasteContent.set(content);
  }

  onToolbarDemoContentChange(content: string) {
    this.toolbarDemoContent.set(content);
  }

  onBubbleMenuDemoContentChange(content: string) {
    this.bubbleMenuDemoContent.set(content);
  }

  onImageContentChange(content: string) {
    this.imageContent.set(content);
  }

  onSlashCommandsContentChange(content: string) {
    this.slashCommandsContent.set(content);
  }

  onFullToolbarContentChange(content: string) {
    this.fullToolbarContent.set(content);
  }

  // Méthodes pour les événements d'éditeur
  onEditorFocus() {
    this.editorState.set("En cours d'édition 🖊️");
  }

  onEditorBlur() {
    this.editorState.set("Sauvegardé ✅");
  }

  toggleAdvancedEditor() {
    this.showAdvancedEditor.update((show) => !show);
  }

  // Méthodes pour configurer la toolbar
  setMinimalToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      separator: false,
    });
  }

  setWritingToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      strike: true,
      heading1: true,
      heading2: true,
      blockquote: true,
      undo: true,
      redo: true,
      separator: true,
    });
  }

  setImageToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      image: true,
      undo: true,
      redo: true,
      separator: true,
    });
  }

  setFullToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      heading1: true,
      heading2: true,
      heading3: true,
      bulletList: true,
      orderedList: true,
      blockquote: true,
      link: true,
      image: true,
      horizontalRule: true,
      undo: true,
      redo: true,
      separator: true,
    });
  }

  setSuperToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      superscript: true,
      subscript: true,
      highlight: true,
      heading1: true,
      heading2: true,
      heading3: true,
      bulletList: true,
      orderedList: true,
      blockquote: true,
      alignLeft: true,
      alignCenter: true,
      alignRight: true,
      alignJustify: true,
      link: true,
      image: true,
      horizontalRule: true,
      undo: true,
      redo: true,
      separator: true,
    });
  }

  setCustomToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      code: true,
      heading1: true,
      bulletList: true,
      orderedList: true,
      image: true,
      undo: true,
      separator: true,
    });
  }

  // Méthodes pour configurer le bubble menu
  setBubbleMenuMinimal() {
    this.currentBubbleMenuConfig.set({
      bold: true,
      italic: true,
      separator: false,
    });
  }

  setBubbleMenuComplete() {
    this.currentBubbleMenuConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      superscript: true,
      subscript: true,
      highlight: true,
      link: true,
      separator: true,
    });
  }

  disableBubbleMenu() {
    this.showBubbleMenuDemo.set(false);
  }

  enableBubbleMenu() {
    this.showBubbleMenuDemo.set(true);
  }

  // Méthode utilitaire pour l'affichage JSON
  JSON = JSON;
}

bootstrapApplication(App, {
  providers: [
    provideAnimationsAsync(),
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: "material-symbols-outlined" },
    },
  ],
});
