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
    <div class="app">
      <!-- Header fin -->
      <header class="header">
        <h1>Tiptap Editor</h1>
        <p>Éditeur de texte moderne pour Angular</p>
      </header>

      <!-- Layout principal -->
      <main class="main">
        <!-- Éditeur -->
        <section class="editor-section">
          <div class="editor-header">
            <h2>Éditeur</h2>
            <div class="stats">
              <span class="stat-item">
                <span class="material-symbols-outlined">build</span>
                {{ getToolbarActiveCount() }}
              </span>
              <span class="stat-item" [class.active]="showBubbleMenuDemo()">
                <span class="material-symbols-outlined">chat_bubble</span>
                Bubble
              </span>
              <span class="stat-item" [class.active]="enableSlashCommands()">
                <span class="material-symbols-outlined">flash_on</span>
                Slash
              </span>
            </div>
          </div>

          <div class="editor-wrapper">
            <tiptap-editor
              [content]="demoContent()"
              [toolbar]="currentToolbarConfig()"
              [bubbleMenu]="currentBubbleMenuConfig()"
              [showBubbleMenu]="showBubbleMenuDemo()"
              [enableSlashCommands]="enableSlashCommands()"
              [showToolbar]="showToolbar()"
              [placeholder]="currentPlaceholder()"
              (contentChange)="onDemoContentChange($event)"
            >
            </tiptap-editor>
          </div>
        </section>

        <!-- Panneau de contrôle -->
        <aside class="controls">
          <div class="controls-header">
            <h3>Configuration</h3>
            <button class="icon-btn" (click)="resetToDefaults()" title="Reset">
              <span class="material-symbols-outlined">refresh</span>
            </button>
          </div>

          <!-- Toolbar -->
          <div class="control-group">
            <div class="group-header">
              <div class="group-title">
                <span class="material-symbols-outlined">build</span>
                <h4>Toolbar</h4>
              </div>
              <label class="toggle">
                <input
                  type="checkbox"
                  [checked]="showToolbar()"
                  (change)="toggleToolbar()"
                />
                <span></span>
              </label>
            </div>

            <div class="preset-grid">
              <button
                class="preset-btn"
                [class.active]="currentPreset() === 'minimal'"
                (click)="setMinimalToolbar()"
                title="Configuration minimale"
              >
                <span class="material-symbols-outlined">minimize</span>
                <span>Minimal</span>
              </button>
              <button
                class="preset-btn"
                [class.active]="currentPreset() === 'writing'"
                (click)="setWritingToolbar()"
                title="Configuration pour l'écriture"
              >
                <span class="material-symbols-outlined">edit</span>
                <span>Écriture</span>
              </button>
              <button
                class="preset-btn"
                [class.active]="currentPreset() === 'full'"
                (click)="setFullToolbar()"
                title="Configuration complète"
              >
                <span class="material-symbols-outlined">apps</span>
                <span>Complet</span>
              </button>
              <button
                class="preset-btn"
                [class.active]="currentPreset() === 'super'"
                (click)="setSuperToolbar()"
                title="Configuration avancée"
              >
                <span class="material-symbols-outlined">rocket_launch</span>
                <span>Pro</span>
              </button>
            </div>
          </div>

          <!-- Bubble Menu -->
          <div class="control-group">
            <div class="group-header">
              <div class="group-title">
                <span class="material-symbols-outlined">chat_bubble</span>
                <h4>Bubble Menu</h4>
              </div>
              <label class="toggle">
                <input
                  type="checkbox"
                  [checked]="showBubbleMenuDemo()"
                  (change)="toggleBubbleMenu()"
                />
                <span></span>
              </label>
            </div>

            <div class="preset-grid two-cols">
              <button
                class="preset-btn"
                [class.active]="currentBubblePreset() === 'minimal'"
                (click)="setBubbleMenuMinimal()"
                title="Bubble menu minimal"
              >
                <span class="material-symbols-outlined">minimize</span>
                <span>Minimal</span>
              </button>
              <button
                class="preset-btn"
                [class.active]="currentBubblePreset() === 'complete'"
                (click)="setBubbleMenuComplete()"
                title="Bubble menu complet"
              >
                <span class="material-symbols-outlined">apps</span>
                <span>Complet</span>
              </button>
            </div>
          </div>

          <!-- Fonctionnalités -->
          <div class="control-group">
            <div class="group-header">
              <div class="group-title">
                <span class="material-symbols-outlined">tune</span>
                <h4>Fonctionnalités</h4>
              </div>
            </div>

            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-info">
                  <span class="material-symbols-outlined">flash_on</span>
                  <span>Slash Commands</span>
                </div>
                <label class="toggle">
                  <input
                    type="checkbox"
                    [checked]="enableSlashCommands()"
                    (change)="toggleSlashCommands()"
                  />
                  <span></span>
                </label>
              </div>
            </div>
          </div>

          <!-- Contenu -->
          <div class="control-group">
            <div class="group-header">
              <div class="group-title">
                <span class="material-symbols-outlined">description</span>
                <h4>Contenu de Test</h4>
              </div>
            </div>

            <div class="content-grid">
              <button
                class="content-btn"
                (click)="loadBasicContent()"
                title="Contenu simple"
              >
                <span class="material-symbols-outlined">article</span>
                <span>Basique</span>
              </button>
              <button
                class="content-btn"
                (click)="loadRichContent()"
                title="Contenu avec formatage"
              >
                <span class="material-symbols-outlined">auto_awesome</span>
                <span>Riche</span>
              </button>
              <button
                class="content-btn"
                (click)="loadImageContent()"
                title="Contenu avec images"
              >
                <span class="material-symbols-outlined">image</span>
                <span>Images</span>
              </button>
              <button
                class="content-btn danger"
                (click)="clearContent()"
                title="Vider l'éditeur"
              >
                <span class="material-symbols-outlined">clear</span>
                <span>Vider</span>
              </button>
            </div>
          </div>

          <!-- Code -->
          <div class="control-group">
            <div class="group-header">
              <div class="group-title">
                <span class="material-symbols-outlined">code</span>
                <h4>Code d'Exemple</h4>
              </div>
              <button
                class="icon-btn"
                (click)="copyCode()"
                title="Copier le code"
              >
                <span class="material-symbols-outlined">content_copy</span>
              </button>
            </div>

            <div class="code-block">
              <pre><code>&lt;tiptap-editor
  [toolbar]="config"
  [bubbleMenu]="bubble"
  [enableSlashCommands]="true"
/&gt;</code></pre>
            </div>
          </div>
        </aside>
      </main>
    </div>
  `,
  styles: [
    `
      /* Reset */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        line-height: 1.5;
        color: #0f172a;
        background: #f8fafc;
        font-size: 14px;
      }

      /* Layout */
      .app {
        min-height: 100vh;
      }

      .header {
        text-align: center;
        padding: 2rem 1rem;
        background: white;
        border-bottom: 1px solid #e2e8f0;
      }

      .header h1 {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        color: #1e293b;
      }

      .header p {
        color: #64748b;
        font-size: 0.875rem;
      }

      .main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem;
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 1.5rem;
      }

      /* Éditeur */
      .editor-section {
        background: white;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }

      .editor-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
      }

      .editor-header h2 {
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .stats {
        display: flex;
        gap: 1rem;
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.75rem;
        color: #64748b;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        transition: all 0.15s;
      }

      .stat-item .material-symbols-outlined {
        font-size: 14px;
      }

      .stat-item.active {
        background: #dbeafe;
        color: #1d4ed8;
      }

      .editor-wrapper {
        padding: 1.5rem;
        min-height: 400px;
      }

      /* Contrôles */
      .controls {
        background: white;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        height: fit-content;
        position: sticky;
        top: 1.5rem;
      }

      .controls-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8fafc;
      }

      .controls-header h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1e293b;
      }

      .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s;
        color: #64748b;
      }

      .icon-btn:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #1e293b;
      }

      .icon-btn .material-symbols-outlined {
        font-size: 16px;
      }

      /* Groupes de contrôles */
      .control-group {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .control-group:last-child {
        border-bottom: none;
      }

      .group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .group-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .group-title .material-symbols-outlined {
        font-size: 16px;
        color: #64748b;
      }

      .group-title h4 {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
      }

      /* Toggle fin */
      .toggle {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
        cursor: pointer;
      }

      .toggle input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle span {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #cbd5e1;
        transition: 0.2s;
        border-radius: 18px;
      }

      .toggle span:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background: white;
        transition: 0.2s;
        border-radius: 50%;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .toggle input:checked + span {
        background: #3b82f6;
      }

      .toggle input:checked + span:before {
        transform: translateX(14px);
      }

      /* Grilles de boutons */
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.375rem;
      }

      .preset-grid.two-cols {
        grid-template-columns: repeat(2, 1fr);
      }

      .content-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.375rem;
      }

      /* Boutons preset */
      .preset-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 0.375rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.15s;
        color: #64748b;
      }

      .preset-btn:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #1e293b;
      }

      .preset-btn.active {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #1d4ed8;
      }

      .preset-btn .material-symbols-outlined {
        font-size: 16px;
      }

      .preset-btn span:last-child {
        font-weight: 500;
      }

      /* Boutons de contenu */
      .content-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 0.375rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.15s;
        color: #64748b;
      }

      .content-btn:hover {
        background: #f1f5f9;
        border-color: #cbd5e1;
        color: #1e293b;
      }

      .content-btn.danger {
        color: #dc2626;
        border-color: #fecaca;
      }

      .content-btn.danger:hover {
        background: #fef2f2;
        border-color: #fca5a5;
        color: #b91c1c;
      }

      .content-btn .material-symbols-outlined {
        font-size: 16px;
      }

      .content-btn span:last-child {
        font-weight: 500;
      }

      /* Feature list */
      .feature-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .feature-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
      }

      .feature-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #1e293b;
      }

      .feature-info .material-symbols-outlined {
        font-size: 16px;
        color: #64748b;
      }

      /* Code block */
      .code-block {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        padding: 0.75rem;
      }

      .code-block pre {
        font-family: "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;
        font-size: 0.75rem;
        line-height: 1.5;
        color: #475569;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .main {
          grid-template-columns: 1fr;
          padding: 1rem;
        }

        .header {
          padding: 1.5rem 1rem;
        }

        .controls {
          position: static;
        }

        .preset-grid,
        .content-grid {
          grid-template-columns: 1fr;
        }

        .stats {
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-item {
          justify-content: center;
        }
      }
    `,
  ],
})
export class App {
  // Signals pour l'état de la démo
  demoContent = signal(`
    <h2>Bienvenue dans l'éditeur Tiptap</h2>
    <p>Un éditeur de texte moderne et simple pour Angular.</p>
    <p>Utilisez le panneau de droite pour tester les différentes configurations.</p>
    <ul>
      <li>Tapez <strong>/</strong> pour les slash commands</li>
      <li>Sélectionnez du texte pour le bubble menu</li>
      <li>Cliquez sur une image pour son menu contextuel</li>
    </ul>
  `);

  // Configuration states
  currentToolbarConfig = signal<Partial<ToolbarConfig>>({
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
    separator: true,
  });

  currentBubbleMenuConfig = signal<Partial<BubbleMenuConfig>>({
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    code: true,
    highlight: true,
    link: true,
    separator: true,
  });

  showBubbleMenuDemo = signal(true);
  enableSlashCommands = signal(true);
  showToolbar = signal(true);
  currentPlaceholder = signal("Commencez à écrire...");
  currentPreset = signal<string>("full");
  currentBubblePreset = signal<string>("complete");

  // Methods for demo content changes
  onDemoContentChange(content: string) {
    this.demoContent.set(content);
  }

  // Toolbar configuration methods
  setMinimalToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      separator: false,
    });
    this.currentPreset.set("minimal");
  }

  setWritingToolbar() {
    this.currentToolbarConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      heading1: true,
      heading2: true,
      blockquote: true,
      undo: true,
      redo: true,
      separator: true,
    });
    this.currentPreset.set("writing");
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
    this.currentPreset.set("full");
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
    this.currentPreset.set("super");
  }

  // Bubble menu configuration methods
  setBubbleMenuMinimal() {
    this.currentBubbleMenuConfig.set({
      bold: true,
      italic: true,
      separator: false,
    });
    this.currentBubblePreset.set("minimal");
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
    this.currentBubblePreset.set("complete");
  }

  // Toggle methods
  toggleToolbar() {
    this.showToolbar.update((show) => !show);
  }

  toggleBubbleMenu() {
    this.showBubbleMenuDemo.update((show) => !show);
  }

  toggleSlashCommands() {
    this.enableSlashCommands.update((enabled) => !enabled);
  }

  // Reset to defaults
  resetToDefaults() {
    this.setFullToolbar();
    this.setBubbleMenuComplete();
    this.showToolbar.set(true);
    this.showBubbleMenuDemo.set(true);
    this.enableSlashCommands.set(true);
    this.demoContent.set(`
      <h2>Bienvenue dans l'éditeur Tiptap</h2>
      <p>Un éditeur de texte moderne et simple pour Angular.</p>
      <p>Utilisez le panneau de droite pour tester les différentes configurations.</p>
      <ul>
        <li>Tapez <strong>/</strong> pour les slash commands</li>
        <li>Sélectionnez du texte pour le bubble menu</li>
        <li>Cliquez sur une image pour son menu contextuel</li>
      </ul>
    `);
  }

  // Content preset methods
  loadBasicContent() {
    this.demoContent.set(`
      <h2>Contenu de Base</h2>
      <p>Voici un exemple simple avec du texte <strong>gras</strong> et <em>italique</em>.</p>
      <ul>
        <li>Premier point</li>
        <li>Deuxième point</li>
      </ul>
    `);
  }

  loadRichContent() {
    this.demoContent.set(`
      <h1>Contenu Riche</h1>
      <p>Démonstration des formatages : <strong>gras</strong>, <em>italique</em>, <u>souligné</u>, <s>barré</s>, <code>code</code>.</p>
      <h2>Listes</h2>
      <ul>
        <li>Liste à puces</li>
        <li>Avec plusieurs éléments</li>
      </ul>
      <ol>
        <li>Liste numérotée</li>
        <li>Dans l'ordre</li>
      </ol>
      <blockquote>
        <p>Une citation avec du style</p>
      </blockquote>
      <p>Et un <a href="https://tiptap.dev">lien vers Tiptap</a>.</p>
    `);
  }

  loadImageContent() {
    this.demoContent.set(`
      <h2>Images</h2>
      <p>Voici une image d'exemple :</p>
      <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop" class="tiptap-image" alt="Image de test">
      <p>Cliquez sur l'image pour voir le menu contextuel.</p>
    `);
  }

  clearContent() {
    this.demoContent.set("<p></p>");
  }

  // Copy code functionality
  copyCode() {
    const code = `<tiptap-editor
  [toolbar]="config"
  [bubbleMenu]="bubble"
  [enableSlashCommands]="true"
/>`;
    navigator.clipboard.writeText(code);
  }

  // Utility methods
  getToolbarActiveCount(): number {
    const config = this.currentToolbarConfig();
    return Object.values(config).filter(Boolean).length;
  }

  getBubbleMenuActiveCount(): number {
    const config = this.currentBubbleMenuConfig();
    return Object.values(config).filter(Boolean).length;
  }

  // Utility for JSON display
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
