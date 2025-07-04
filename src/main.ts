import { Component, signal, effect, ElementRef, inject } from "@angular/core";
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

// Import des types pour les slash commands
import {
  SlashCommandsConfig,
  SlashCommandItem,
  DEFAULT_SLASH_COMMANDS,
} from "tiptap-editor";
import { computed } from "@angular/core";

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
    <div class="app" #appRef>
      <!-- Layout principal -->
      <div
        class="container"
        [class.sidebar-hidden]="!showSidebar()"
        [class.sidebar-open]="showSidebar() || isTransitioning()"
      >
        <!-- Éditeur principal -->
        <main class="editor-main">
          <!-- Actions de l'éditeur - Toujours visibles -->
          <div class="editor-actions">
            <!-- Toggle Code/Éditeur -->
            <div class="mode-toggle">
              <button
                class="mode-btn"
                [class.active]="!showCodeMode()"
                (click)="showCodeMode.set(false)"
                title="Mode éditeur"
              >
                <span class="material-symbols-outlined">edit</span>
                <span>Éditeur</span>
              </button>
              <button
                class="mode-btn"
                [class.active]="showCodeMode()"
                (click)="showCodeMode.set(true)"
                title="Mode code"
              >
                <span class="material-symbols-outlined">code</span>
                <span>Code</span>
              </button>
            </div>

            <div class="action-separator"></div>

            <button
              class="editor-action-btn"
              (click)="clearContent()"
              title="Vider l'éditeur"
            >
              <span class="material-symbols-outlined">delete</span>
              <span>Vider</span>
            </button>
          </div>

          <!-- Contenu principal -->
          <div class="main-content">
            <!-- Mode éditeur -->
            <div class="editor-view" *ngIf="!showCodeMode()">
              <tiptap-editor
                [content]="demoContent()"
                [toolbar]="currentToolbarConfig()"
                [bubbleMenu]="currentBubbleMenuConfig()"
                [showBubbleMenu]="showBubbleMenuDemo()"
                [enableSlashCommands]="enableSlashCommands()"
                [slashCommandsConfig]="currentSlashCommandsConfig()"
                [showToolbar]="showToolbar()"
                [placeholder]="currentPlaceholder()"
                (contentChange)="onDemoContentChange($event)"
              >
              </tiptap-editor>
            </div>

            <!-- Mode code -->
            <div class="code-view" *ngIf="showCodeMode()">
              <div class="code-header">
                <div class="code-title">
                  <span class="material-symbols-outlined"
                    >integration_instructions</span
                  >
                  <span>Code généré</span>
                </div>
                <button
                  class="copy-code-btn"
                  (click)="copyCode()"
                  title="Copier le code"
                >
                  <span class="material-symbols-outlined">content_copy</span>
                  <span>Copier</span>
                </button>
              </div>

              <div class="code-container">
                <pre class="code-block"><code>{{ generatedCode() }}</code></pre>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar de configuration -->
        <aside class="sidebar" [class.hidden]="!showSidebar()">
          <div class="sidebar-container">
            <!-- Header du sidebar -->
            <div class="sidebar-header">
              <div class="header-content">
                <div class="logo">
                  <span class="material-symbols-outlined">tune</span>
                  <h1>Configuration</h1>
                </div>
                <div class="header-actions">
                  <button
                    class="panel-btn secondary"
                    (click)="resetToDefaults()"
                    title="Réinitialiser la configuration"
                  >
                    <span class="material-symbols-outlined">restart_alt</span>
                  </button>
                  <button
                    class="panel-btn danger"
                    (click)="toggleSidebar()"
                    title="Fermer le panneau"
                  >
                    <span class="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <!-- Status bar intégré -->
              <div class="status-bar">
                <div class="status-item" [class.active]="showToolbar()">
                  <span class="material-symbols-outlined">build</span>
                  <span>{{ getToolbarActiveCount() }}</span>
                </div>
                <div class="status-item" [class.active]="showBubbleMenuDemo()">
                  <span class="material-symbols-outlined">chat_bubble</span>
                  <span>Bubble</span>
                </div>
                <div class="status-item" [class.active]="enableSlashCommands()">
                  <span class="material-symbols-outlined">flash_on</span>
                  <span>{{ getSlashCommandsActiveCount() }}</span>
                </div>
              </div>
            </div>

            <!-- Actions de l'éditeur dans la sidebar -->
            <div class="editor-controls">
              <button
                class="editor-control-btn"
                (click)="clearContent()"
                title="Vider l'éditeur"
              >
                <span class="material-symbols-outlined">delete</span>
                <span>Vider l'éditeur</span>
              </button>
            </div>

            <!-- Configuration sections -->
            <div class="config-sections">
              <!-- Toolbar -->
              <section class="config-section">
                <div class="section-header">
                  <div class="section-title">
                    <span class="material-symbols-outlined">build</span>
                    <span>Toolbar</span>
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

                <div class="section-content" [class.collapsed]="!showToolbar()">
                  <div class="dropdown-section">
                    <div class="dropdown-trigger" (click)="toggleToolbarMenu()">
                      <span>Personnaliser ({{ getToolbarActiveCount() }})</span>
                      <span
                        class="material-symbols-outlined chevron"
                        [class.rotated]="showToolbarMenu()"
                      >
                        keyboard_arrow_down
                      </span>
                    </div>

                    <div
                      class="dropdown-content"
                      [class.open]="showToolbarMenu()"
                    >
                      <div class="options-grid">
                        <label class="option" *ngFor="let item of toolbarItems">
                          <input
                            type="checkbox"
                            [checked]="isToolbarItemActive(item.key)"
                            (change)="toggleToolbarItem(item.key)"
                          />
                          <span class="checkmark"></span>
                          <span class="material-symbols-outlined">{{
                            item.icon
                          }}</span>
                          <span class="label">{{ item.label }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Bubble Menu -->
              <section class="config-section">
                <div class="section-header">
                  <div class="section-title">
                    <span class="material-symbols-outlined">chat_bubble</span>
                    <span>Bubble Menu</span>
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

                <div
                  class="section-content"
                  [class.collapsed]="!showBubbleMenuDemo()"
                >
                  <div class="dropdown-section">
                    <div
                      class="dropdown-trigger"
                      (click)="toggleBubbleMenuMenu()"
                    >
                      <span
                        >Personnaliser ({{ getBubbleMenuActiveCount() }})</span
                      >
                      <span
                        class="material-symbols-outlined chevron"
                        [class.rotated]="showBubbleMenuMenu()"
                      >
                        keyboard_arrow_down
                      </span>
                    </div>

                    <div
                      class="dropdown-content"
                      [class.open]="showBubbleMenuMenu()"
                    >
                      <div class="options-grid">
                        <label
                          class="option"
                          *ngFor="let item of bubbleMenuItems"
                        >
                          <input
                            type="checkbox"
                            [checked]="isBubbleMenuItemActive(item.key)"
                            (change)="toggleBubbleMenuItem(item.key)"
                          />
                          <span class="checkmark"></span>
                          <span class="material-symbols-outlined">{{
                            item.icon
                          }}</span>
                          <span class="label">{{ item.label }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Slash Commands -->
              <section class="config-section">
                <div class="section-header">
                  <div class="section-title">
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

                <div
                  class="section-content"
                  [class.collapsed]="!enableSlashCommands()"
                >
                  <div class="dropdown-section">
                    <div
                      class="dropdown-trigger"
                      (click)="toggleSlashCommandsMenu()"
                    >
                      <span
                        >Personnaliser ({{
                          getSlashCommandsActiveCount()
                        }})</span
                      >
                      <span
                        class="material-symbols-outlined chevron"
                        [class.rotated]="showSlashCommandsMenu()"
                      >
                        keyboard_arrow_down
                      </span>
                    </div>

                    <div
                      class="dropdown-content"
                      [class.open]="showSlashCommandsMenu()"
                    >
                      <div class="options-grid">
                        <label
                          class="option"
                          *ngFor="let item of slashCommandItems"
                        >
                          <input
                            type="checkbox"
                            [checked]="isSlashCommandActive(item.key)"
                            (change)="toggleSlashCommand(item.key)"
                          />
                          <span class="checkmark"></span>
                          <span class="material-symbols-outlined">{{
                            item.icon
                          }}</span>
                          <span class="label">{{ item.label }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Footer -->
            <div class="sidebar-footer">
              <button class="copy-btn" (click)="copyCode()">
                <span class="material-symbols-outlined">content_copy</span>
                <span>Copier le code</span>
              </button>
            </div>
          </div>
        </aside>

        <!-- Bouton d'ouverture (quand sidebar fermée) -->
        <button
          class="open-sidebar-btn"
          *ngIf="!showSidebar()"
          (click)="toggleSidebar()"
          title="Ouvrir la configuration"
        >
          <span class="material-symbols-outlined">tune</span>
        </button>

        <!-- Élément de transition pour l'animation -->
        <div class="transition-element" *ngIf="isTransitioning()">
          <div class="transition-content">
            <span class="material-symbols-outlined transition-icon">tune</span>
          </div>

          <div class="transition-panel-content">
            <div class="sidebar-container">
              <!-- Header du sidebar -->
              <div class="sidebar-header">
                <div class="header-content">
                  <div class="logo">
                    <span class="material-symbols-outlined">tune</span>
                    <h1>Configuration</h1>
                  </div>
                  <div class="header-actions">
                    <button
                      class="panel-btn secondary"
                      (click)="resetToDefaults()"
                      title="Réinitialiser la configuration"
                    >
                      <span class="material-symbols-outlined">restart_alt</span>
                    </button>
                    <button
                      class="panel-btn danger"
                      (click)="toggleSidebar()"
                      title="Fermer le panneau"
                    >
                      <span class="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                <!-- Status bar intégré -->
                <div class="status-bar">
                  <div class="status-item" [class.active]="showToolbar()">
                    <span class="material-symbols-outlined">build</span>
                    <span>{{ getToolbarActiveCount() }}</span>
                  </div>
                  <div
                    class="status-item"
                    [class.active]="showBubbleMenuDemo()"
                  >
                    <span class="material-symbols-outlined">chat_bubble</span>
                    <span>Bubble</span>
                  </div>
                  <div
                    class="status-item"
                    [class.active]="enableSlashCommands()"
                  >
                    <span class="material-symbols-outlined">flash_on</span>
                    <span>{{ getSlashCommandsActiveCount() }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions de l'éditeur dans la sidebar -->
              <div class="editor-controls">
                <button
                  class="editor-control-btn"
                  (click)="clearContent()"
                  title="Vider l'éditeur"
                >
                  <span class="material-symbols-outlined">delete</span>
                  <span>Vider l'éditeur</span>
                </button>
              </div>

              <!-- Configuration sections -->
              <div class="config-sections">
                <!-- Contenu simplifié pour la transition -->
                <div style="padding: 1rem; text-align: center; color: #64748b;">
                  Configuration en cours de chargement...
                </div>
              </div>

              <!-- Footer -->
              <div class="sidebar-footer">
                <button class="copy-btn" (click)="copyCode()">
                  <span class="material-symbols-outlined">content_copy</span>
                  <span>Copier le code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Reset et base */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        line-height: 1.5;
        color: #1a1a1a;
        background: #fafafa;
        font-size: 14px;
      }

      /* Layout principal */
      .app {
        min-height: 100vh;
        background: #fafafa;
      }

      .container {
        display: block;
        min-height: 100vh;
      }

      .container.sidebar-hidden {
        /* Pas de changement, l'éditeur occupe toujours toute la largeur */
      }

      /* Éditeur principal */
      .editor-main {
        max-width: 1000px;
        margin: 0 auto;
        padding: 2rem;
        background: #fafafa;
        min-height: 100vh;
        position: relative;
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Ajustement de l'éditeur quand le sidebar est ouvert */
      .sidebar-open .editor-main {
        max-width: 800px;
        transform: translateX(-40px);
      }

      .container.sidebar-hidden .editor-main {
        /* Pas de changement nécessaire */
      }

      /* Contenu principal */
      .main-content {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding-top: 60px; /* Espace pour les actions */
      }

      .editor-view,
      .code-view {
        animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Actions de l'éditeur - Toujours visibles */
      .editor-actions {
        position: absolute;
        top: 2rem;
        right: 2rem;
        left: 2rem;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
      }

      /* Toggle Mode */
      .mode-toggle {
        display: flex;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 2px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .mode-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }

      .mode-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 6px;
      }

      .mode-btn:hover {
        color: #6366f1;
      }

      .mode-btn:hover::before {
        opacity: 0.1;
      }

      .mode-btn.active {
        background: white;
        color: #6366f1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .mode-btn.active::before {
        opacity: 0.1;
      }

      .mode-btn .material-symbols-outlined {
        font-size: 18px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      /* Toggle compact pour sidebar */
      .mode-toggle-compact {
        display: flex;
        background: #f1f5f9;
        border-radius: 6px;
        padding: 2px;
        border: 1px solid #e2e8f0;
      }

      .mode-btn-compact {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .mode-btn-compact::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 4px;
      }

      .mode-btn-compact:hover {
        color: #6366f1;
      }

      .mode-btn-compact:hover::before {
        opacity: 0.1;
      }

      .mode-btn-compact.active {
        background: white;
        color: #6366f1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .mode-btn-compact.active::before {
        opacity: 0.1;
      }

      .mode-btn-compact .material-symbols-outlined {
        font-size: 16px;
        position: relative;
        z-index: 1;
      }

      /* Séparateurs */
      .action-separator {
        width: 1px;
        height: 24px;
        background: #e2e8f0;
        flex-shrink: 0;
      }

      .action-separator-compact {
        width: 1px;
        height: 20px;
        background: #e2e8f0;
        flex-shrink: 0;
        margin: 0 4px;
      }

      .editor-action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        white-space: nowrap;
      }

      .editor-action-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .editor-action-btn:hover {
        color: #ef4444;
        transform: translateY(-1px);
      }

      .editor-action-btn:hover::before {
        opacity: 0.1;
      }

      .editor-action-btn:active {
        transform: translateY(0);
      }

      .editor-action-btn .material-symbols-outlined {
        font-size: 20px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      /* Bouton d'ouverture de la sidebar - Style Tiptap */
      .open-sidebar-btn {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 100;
        width: 48px;
        height: 48px;
        background: white;
        color: #64748b;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform-origin: center;
      }

      /* État de transformation du bouton */
      .open-sidebar-btn.transforming {
        width: 360px;
        height: calc(100vh - 4rem);
        top: 2rem;
        right: 1.5rem;
        border-radius: 16px;
        background: transparent;
        border: none;
        box-shadow: none;
        pointer-events: none;
      }

      .open-sidebar-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 16px;
      }

      .open-sidebar-btn:hover:not(.transforming) {
        color: #6366f1;
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
      }

      .open-sidebar-btn:hover:not(.transforming)::before {
        opacity: 0.1;
      }

      .open-sidebar-btn:active:not(.transforming) {
        transform: translateY(0) scale(1.02);
      }

      /* Icône du bouton */
      .open-sidebar-btn .material-symbols-outlined {
        font-size: 24px;
        position: relative;
        z-index: 1;
        transition: opacity 0.3s ease;
      }

      .open-sidebar-btn.transforming .material-symbols-outlined {
        opacity: 0;
      }

      /* Sidebar */
      .sidebar {
        position: fixed;
        top: 2rem;
        right: 1.5rem;
        width: 360px;
        height: calc(100vh - 4rem);
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
        box-sizing: border-box;
        z-index: 100;
        opacity: 1;
        transform: none;
      }

      .sidebar.hidden {
        display: none;
      }

      /* Container principal du sidebar */
      .sidebar-container {
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        opacity: 1;
        transform: none;
      }

      .sidebar:not(.hidden) .sidebar-container {
        /* Pas d'animation supplémentaire */
      }

      /* Header du sidebar */
      .sidebar-header {
        background: #f8f9fa;
        border-bottom: 1px solid #e2e8f0;
        border-radius: 16px 16px 0 0;
        position: sticky;
        top: 0;
        z-index: 10;
        flex-shrink: 0;
      }

      .header-content {
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 60px;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .logo .material-symbols-outlined {
        font-size: 20px;
        color: #6366f1;
      }

      .logo h1 {
        font-size: 1rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      /* Boutons du panel - Style Tiptap exact */
      .panel-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        flex-shrink: 0;
      }

      .panel-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .panel-btn.secondary {
        color: #64748b;
      }

      .panel-btn.secondary::before {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
      }

      .panel-btn.secondary:hover {
        color: #6366f1;
        transform: translateY(-1px);
      }

      .panel-btn.secondary:hover::before {
        opacity: 0.1;
      }

      .panel-btn.danger {
        color: #ef4444;
      }

      .panel-btn.danger::before {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      .panel-btn.danger:hover {
        color: #dc2626;
        transform: translateY(-1px);
      }

      .panel-btn.danger:hover::before {
        opacity: 0.1;
      }

      .panel-btn:active {
        transform: translateY(0);
      }

      .panel-btn .material-symbols-outlined {
        font-size: 18px;
        position: relative;
        z-index: 1;
      }

      /* Status bar */
      .status-bar {
        padding: 1rem 1.5rem;
        background: white;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 4px;
        justify-content: space-between;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.5rem 0.75rem;
        border-radius: 8px;
        font-size: 0.8rem;
        color: #64748b;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: #f8f9fa;
        flex: 1;
        justify-content: center;
        position: relative;
        overflow: hidden;
        min-width: 0;
        white-space: nowrap;
      }

      .status-item::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .status-item.active {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }

      .status-item.active::before {
        opacity: 0.15;
      }

      .status-item .material-symbols-outlined {
        font-size: 14px;
        position: relative;
        z-index: 1;
        flex-shrink: 0;
      }

      /* Actions de l'éditeur dans la sidebar - Style Tiptap */
      .editor-controls {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        background: white;
      }

      .editor-control-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #ef4444;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }

      .editor-control-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .editor-control-btn:hover {
        color: #dc2626;
        transform: translateY(-1px);
      }

      .editor-control-btn:hover::before {
        opacity: 0.1;
      }

      .editor-control-btn:active {
        transform: translateY(0);
      }

      .editor-control-btn .material-symbols-outlined {
        font-size: 16px;
        position: relative;
        z-index: 1;
      }

      /* Sections de configuration */
      .config-sections {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        /* Masquer la barre de scroll */
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
      }

      .config-sections::-webkit-scrollbar {
        display: none; /* WebKit */
      }

      .config-section {
        border-bottom: 1px solid #e2e8f0;
      }

      .section-header {
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        position: sticky;
        top: 0;
        z-index: 1;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
        color: #1a1a1a;
        font-size: 0.9rem;
      }

      .section-title .material-symbols-outlined {
        font-size: 18px;
        color: #64748b;
      }

      .section-content {
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .section-content.collapsed {
        opacity: 0.5;
        pointer-events: none;
      }

      /* Dropdown */
      .dropdown-section {
        position: relative;
      }

      .dropdown-trigger {
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        background: #f8f9fa;
        border-top: 1px solid #e2e8f0;
        font-size: 0.85rem;
        color: #64748b;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dropdown-trigger:hover {
        background: #f1f5f9;
        color: #475569;
      }

      .chevron {
        font-size: 18px !important;
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .chevron.rotated {
        transform: rotate(180deg);
      }

      .dropdown-content {
        max-height: 0;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        background: white;
      }

      .dropdown-content.open {
        max-height: 350px;
        overflow-y: auto;
      }

      .options-grid {
        padding: 0.75rem;
        display: grid;
        gap: 2px;
      }

      .option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.85rem;
        position: relative;
        overflow: hidden;
      }

      .option::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .option:hover {
        color: #6366f1;
        transform: translateY(-1px);
      }

      .option:hover::before {
        opacity: 0.1;
      }

      .option input {
        display: none;
      }

      .checkmark {
        width: 16px;
        height: 16px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        z-index: 1;
      }

      .option input:checked + .checkmark {
        background: #6366f1;
        border-color: #6366f1;
      }

      .option input:checked + .checkmark:after {
        content: "";
        position: absolute;
        left: 4px;
        top: 1px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .option .material-symbols-outlined {
        font-size: 16px;
        color: #64748b;
        position: relative;
        z-index: 1;
      }

      .option .label {
        flex: 1;
        color: #1a1a1a;
        position: relative;
        z-index: 1;
      }

      /* Toggle - Style Tiptap exact */
      .toggle {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
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
        background: #d1d5db;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 20px;
      }

      .toggle span:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background: white;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .toggle input:checked + span {
        background: #6366f1;
      }

      .toggle input:checked + span:before {
        transform: translateX(16px);
      }

      /* Footer */
      .sidebar-footer {
        padding: 1.5rem;
        border-top: 1px solid #e2e8f0;
        background: #f8f9fa;
        flex-shrink: 0;
        border-radius: 0 0 16px 16px;
      }

      .copy-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 40px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 0.875rem;
        font-weight: 500;
        position: relative;
        overflow: hidden;
      }

      .copy-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #5b21b6, #7c3aed);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .copy-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      }

      .copy-btn:hover::before {
        opacity: 1;
      }

      .copy-btn:active {
        transform: translateY(0);
      }

      .copy-btn .material-symbols-outlined {
        font-size: 18px;
        position: relative;
        z-index: 1;
      }

      /* Mode Code - Largeur limitée */
      .code-view {
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        max-width: 100%;
      }

      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        background: #f8f9fa;
        border-bottom: 1px solid #e2e8f0;
      }

      .code-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.9rem;
      }

      .code-title .material-symbols-outlined {
        font-size: 18px;
        color: #6366f1;
      }

      .copy-code-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 12px;
        height: 32px;
        background: transparent;
        color: #64748b;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .copy-code-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        opacity: 0;
        transition: opacity 0.2s ease;
        border-radius: 8px;
      }

      .copy-code-btn:hover {
        color: #6366f1;
        transform: translateY(-1px);
      }

      .copy-code-btn:hover::before {
        opacity: 0.1;
      }

      .copy-code-btn:active {
        transform: translateY(0);
      }

      .copy-code-btn .material-symbols-outlined {
        font-size: 16px;
        position: relative;
        z-index: 1;
      }

      .code-container {
        max-height: 70vh;
        overflow-y: auto;
        overflow-x: auto;
        background: #1e293b;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 8px;
        font-family: "Courier New", monospace;
        font-size: 14px;
        line-height: 1.5;
        white-space: pre-wrap;
        max-width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
      }

      .code-block {
        margin: 0;
        padding: 1.5rem;
        font-family: "Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace;
        font-size: 14px;
        line-height: 1.6;
        color: #e2e8f0;
        background: transparent;
        white-space: pre;
        word-wrap: break-word;
        max-width: 100%;
      }

      /* Coloration syntaxique */
      .code-container .keyword {
        color: #f472b6;
        font-weight: 600;
      }

      .code-container .type {
        color: #60a5fa;
        font-weight: 500;
      }

      .code-container .string {
        color: #34d399;
      }

      .code-container .comment {
        color: #6b7280;
        font-style: italic;
      }

      .code-container .decorator {
        color: #fbbf24;
        font-weight: 600;
      }

      .code-container .punctuation {
        color: #94a3b8;
      }

      /* Scrollbar personnalisée pour le code */
      .code-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .code-container::-webkit-scrollbar-track {
        background: #334155;
      }

      .code-container::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 4px;
      }

      .code-container::-webkit-scrollbar-thumb:hover {
        background: #64748b;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .editor-actions {
          top: 1.5rem;
          right: 1.5rem;
          left: 1.5rem;
        }

        .main-content {
          padding-top: 56px;
        }

        .open-sidebar-btn {
          top: 1.5rem;
          right: 1.5rem;
          width: 44px;
          height: 44px;
        }

        /* Pas de décalage sur tablette - sidebar en bas */
        .sidebar-open .editor-main {
          transform: none;
        }

        .container {
          flex-direction: column;
        }

        .container.sidebar-hidden {
          justify-content: flex-start;
        }

        .sidebar {
          width: 100%;
          padding: 1.5rem;
          order: 2;
          position: relative;
          height: auto;
          max-height: 60vh;
        }

        .sidebar.hidden {
          width: 100%;
          height: 0;
          max-height: 0;
          padding: 0;
        }

        .sidebar-container {
          border-radius: 12px;
        }

        .sidebar-header {
          border-radius: 12px 12px 0 0;
        }

        .sidebar-footer {
          border-radius: 0 0 12px 12px;
        }

        .editor-main {
          padding: 1rem;
          order: 1;
          min-height: auto;
        }

        .container.sidebar-hidden .editor-main {
          max-width: none;
          margin: 0;
          padding: 1.5rem;
        }

        .header-content {
          padding: 1rem 1.5rem;
          min-height: 56px;
        }

        .status-bar {
          padding: 0.875rem 1.5rem;
          flex-wrap: wrap;
          gap: 6px;
        }

        .status-item {
          flex: 1;
          min-width: calc(33.333% - 4px);
        }

        .dropdown-content.open {
          max-height: 250px;
        }

        /* Ajustements pour les boutons mode */
        .mode-toggle {
          flex-wrap: nowrap;
        }

        .mode-btn {
          font-size: 13px;
          padding: 0 10px;
        }

        .mode-btn .material-symbols-outlined {
          font-size: 16px;
        }
      }

      @media (max-width: 768px) {
        .editor-actions {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .main-content {
          padding-top: 80px;
        }

        .mode-toggle {
          order: 1;
        }

        .action-separator {
          display: none;
        }

        .editor-action-btn {
          order: 2;
          font-size: 13px;
          padding: 0 10px;
          height: 28px;
        }

        .editor-action-btn .material-symbols-outlined {
          font-size: 18px;
        }

        .open-sidebar-btn {
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
        }

        .open-sidebar-btn .material-symbols-outlined {
          font-size: 20px;
        }

        .editor-main {
          padding: 1rem;
        }

        /* Pas de décalage sur mobile */
        .sidebar-open .editor-main {
          transform: none;
        }

        .container.sidebar-hidden .editor-main {
          padding: 1rem;
        }

        .header-content {
          padding: 0.875rem 1rem;
          min-height: 52px;
        }

        .logo h1 {
          font-size: 0.9rem;
        }

        .status-bar {
          padding: 0.75rem 1rem;
          flex-direction: column;
          gap: 4px;
        }

        .status-item {
          font-size: 0.75rem;
          padding: 0.375rem 0.5rem;
          flex: none;
          min-width: auto;
        }

        .sidebar {
          max-height: 50vh;
          padding: 1rem;
        }

        .sidebar-container {
          border-radius: 10px;
        }

        .sidebar-header {
          border-radius: 10px 10px 0 0;
        }

        .sidebar-footer {
          border-radius: 0 0 10px 10px;
        }

        .editor-controls {
          padding: 0.75rem 1rem;
        }

        /* Header actions mobile */
        .header-actions {
          gap: 6px;
        }

        .panel-btn {
          width: 28px;
          height: 28px;
        }

        .panel-btn .material-symbols-outlined {
          font-size: 16px;
        }
      }

      @media (max-width: 480px) {
        .editor-actions {
          top: 0.75rem;
          right: 0.75rem;
          left: 0.75rem;
        }

        .main-content {
          padding-top: 70px;
        }

        .editor-main {
          padding: 0.75rem;
        }

        /* Pas de décalage sur mobile */
        .sidebar-open .editor-main {
          transform: none;
        }

        .container.sidebar-hidden .editor-main {
          padding: 0.75rem;
        }

        .header-content {
          padding: 0.75rem;
          min-height: 48px;
        }

        .logo {
          gap: 0.5rem;
        }

        .logo .material-symbols-outlined {
          font-size: 18px;
        }

        .logo h1 {
          font-size: 0.85rem;
        }

        .status-bar {
          padding: 0.5rem;
        }

        .status-item {
          font-size: 0.7rem;
          padding: 0.25rem 0.375rem;
        }

        .editor-controls {
          padding: 0.5rem;
        }

        .editor-control-btn {
          font-size: 13px;
          height: 28px;
        }

        .mode-btn {
          font-size: 12px;
          padding: 0 8px;
          height: 28px;
        }

        .mode-btn .material-symbols-outlined {
          font-size: 14px;
        }

        .editor-action-btn {
          font-size: 12px;
          padding: 0 8px;
          height: 26px;
        }

        .editor-action-btn .material-symbols-outlined {
          font-size: 16px;
        }
      }

      /* Animations - Nettoyées */

      /* Élément de transition */
      .transition-element {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 150;
        width: 48px;
        height: 48px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .transition-element.expanding {
        width: 360px;
        height: calc(100vh - 4rem);
        right: 1.5rem;
      }

      .transition-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s ease;
      }

      .transition-element.expanding .transition-content {
        opacity: 0;
        pointer-events: none;
      }

      .transition-icon {
        font-size: 24px;
        color: #64748b;
        transition: all 0.3s ease;
      }

      /* Contenu du panel dans la transition */
      .transition-panel-content {
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.4s ease 0.4s;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .transition-element.expanding .transition-panel-content {
        opacity: 1;
        transform: scale(1);
      }
    `,
  ],
})
export class App {
  // Injection des services
  private elementRef = inject(ElementRef);

  // Signaux pour l'état de l'application
  showSidebar = signal(true);
  showCodeMode = signal(false);
  isTransitioning = signal(false);
  demoContent = signal(`
    <h1>Guide d'utilisation de l'éditeur Tiptap</h1>
    
    <p>Bienvenue dans cette démonstration interactive de l'éditeur Tiptap pour Angular. Cet éditeur offre une expérience d'édition riche et moderne.</p>
    
    <h2>Fonctionnalités principales</h2>
    
    <p><strong>Formatage de texte :</strong> Vous pouvez mettre en <strong>gras</strong>, <em>italique</em>, <u>souligné</u>, <s>barré</s>, ou encore utiliser du <code>code inline</code>.</p>
    
    <p>Vous pouvez également utiliser des exposants comme E=mc<sup>2</sup> ou des indices comme H<sub>2</sub>O.</p>
    
    <p><mark>Le surlignage</mark> permet de mettre en évidence des passages importants.</p>
    
    <h3>Listes et organisation</h3>
    
    <ul>
      <li>Listes à puces</li>
      <li>Parfaites pour organiser les idées</li>
      <li>Faciles à créer et modifier</li>
    </ul>
    
    <ol>
      <li>Listes numérotées</li>
      <li>Pour les étapes séquentielles</li>
      <li>Ou les instructions</li>
    </ol>
    
    <blockquote>
      <p>Les citations permettent de mettre en valeur des passages importants ou des témoignages.</p>
    </blockquote>
    
    <h3>Alignement du texte</h3>
    
    <p style="text-align: center">Ce texte est centré</p>
    
    <p style="text-align: right">Ce texte est aligné à droite</p>
    
    <p style="text-align: justify">Ce texte est justifié. Il s'étend sur toute la largeur disponible, créant des lignes de longueur égale pour une présentation uniforme et professionnelle.</p>
    
    <h3>Commandes slash</h3>
    
    <p>Tapez <code>/</code> n'importe où dans l'éditeur pour accéder rapidement aux commandes :</p>
    
    <ul>
      <li><code>/h1</code>, <code>/h2</code>, <code>/h3</code> pour les titres</li>
      <li><code>/ul</code> pour les listes à puces</li>
      <li><code>/ol</code> pour les listes numérotées</li>
      <li><code>/quote</code> pour les citations</li>
      <li><code>/code</code> pour les blocs de code</li>
      <li><code>/image</code> pour insérer une image</li>
    </ul>
    
    <hr>
    
    <p><em>Explorez les options de configuration dans le panneau de droite pour personnaliser votre éditeur !</em></p>
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

  // Configuration des slash commands
  currentSlashCommandsConfig = signal<SlashCommandsConfig>({
    commands: DEFAULT_SLASH_COMMANDS,
  });

  // État des slash commands actifs
  activeSlashCommands = signal<Set<string>>(
    new Set([
      "heading1",
      "heading2",
      "heading3",
      "bulletList",
      "orderedList",
      "blockquote",
      "code",
      "image",
      "horizontalRule",
    ])
  );

  showBubbleMenuDemo = signal(true);
  enableSlashCommands = signal(true);
  showToolbar = signal(true);
  currentPlaceholder = signal("Commencez à écrire...");

  // UI states
  showToolbarMenu = signal(false);
  showBubbleMenuMenu = signal(false);
  showSlashCommandsMenu = signal(false);

  // Configuration des éléments disponibles
  toolbarItems = [
    { key: "bold", label: "Gras", icon: "format_bold" },
    { key: "italic", label: "Italique", icon: "format_italic" },
    { key: "underline", label: "Souligné", icon: "format_underlined" },
    { key: "strike", label: "Barré", icon: "format_strikethrough" },
    { key: "code", label: "Code", icon: "code" },
    { key: "superscript", label: "Exposant", icon: "superscript" },
    { key: "subscript", label: "Indice", icon: "subscript" },
    { key: "highlight", label: "Surligner", icon: "highlight" },
    { key: "heading1", label: "Titre 1", icon: "title" },
    { key: "heading2", label: "Titre 2", icon: "title" },
    { key: "heading3", label: "Titre 3", icon: "title" },
    { key: "bulletList", label: "Liste à puces", icon: "format_list_bulleted" },
    {
      key: "orderedList",
      label: "Liste numérotée",
      icon: "format_list_numbered",
    },
    { key: "blockquote", label: "Citation", icon: "format_quote" },
    { key: "alignLeft", label: "Aligner à gauche", icon: "format_align_left" },
    { key: "alignCenter", label: "Centrer", icon: "format_align_center" },
    {
      key: "alignRight",
      label: "Aligner à droite",
      icon: "format_align_right",
    },
    { key: "alignJustify", label: "Justifier", icon: "format_align_justify" },
    { key: "link", label: "Lien", icon: "link" },
    { key: "image", label: "Image", icon: "image" },
    {
      key: "horizontalRule",
      label: "Ligne horizontale",
      icon: "horizontal_rule",
    },
    { key: "undo", label: "Annuler", icon: "undo" },
    { key: "redo", label: "Refaire", icon: "redo" },
    { key: "separator", label: "Séparateur", icon: "more_vert" },
  ];

  bubbleMenuItems = [
    { key: "bold", label: "Gras", icon: "format_bold" },
    { key: "italic", label: "Italique", icon: "format_italic" },
    { key: "underline", label: "Souligné", icon: "format_underlined" },
    { key: "strike", label: "Barré", icon: "format_strikethrough" },
    { key: "code", label: "Code", icon: "code" },
    { key: "superscript", label: "Exposant", icon: "superscript" },
    { key: "subscript", label: "Indice", icon: "subscript" },
    { key: "highlight", label: "Surligner", icon: "highlight" },
    { key: "link", label: "Lien", icon: "link" },
    { key: "separator", label: "Séparateur", icon: "more_vert" },
  ];

  // Configuration des slash commands disponibles
  slashCommandItems = [
    { key: "heading1", label: "Titre 1", icon: "format_h1" },
    { key: "heading2", label: "Titre 2", icon: "format_h2" },
    { key: "heading3", label: "Titre 3", icon: "format_h3" },
    { key: "bulletList", label: "Liste à puces", icon: "format_list_bulleted" },
    {
      key: "orderedList",
      label: "Liste numérotée",
      icon: "format_list_numbered",
    },
    { key: "blockquote", label: "Citation", icon: "format_quote" },
    { key: "code", label: "Code", icon: "code" },
    { key: "image", label: "Image", icon: "image" },
    {
      key: "horizontalRule",
      label: "Ligne horizontale",
      icon: "horizontal_rule",
    },
  ];

  // Computed pour le code généré
  generatedCode = computed(() => {
    const toolbarConfig = this.currentToolbarConfig();
    const bubbleMenuConfig = this.currentBubbleMenuConfig();
    const slashCommandsConfig = this.currentSlashCommandsConfig();

    // Filtrer les propriétés actives seulement
    const activeToolbar = Object.entries(toolbarConfig)
      .filter(([_, value]) => value)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const activeBubbleMenu = Object.entries(bubbleMenuConfig)
      .filter(([_, value]) => value)
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    const toolbarConfigStr = JSON.stringify(activeToolbar, null, 2);
    const bubbleMenuConfigStr = JSON.stringify(activeBubbleMenu, null, 2);

    // Simplifier la config des slash commands
    const hasSlashCommands =
      slashCommandsConfig.commands && slashCommandsConfig.commands.length > 0;
    const slashCommandsStr = hasSlashCommands
      ? `{\n  commands: [\n    // ${
          slashCommandsConfig.commands?.length || 0
        } commandes configurées\n  ]\n}`
      : "{ commands: [] }";

    return `import { Component } from '@angular/core';
import { TiptapEditorComponent } from 'tiptap-editor';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TiptapEditorComponent],
  template: \`
    <tiptap-editor
      [content]="content"
      [toolbar]="toolbarConfig"
      [bubbleMenu]="bubbleMenuConfig"
      [showBubbleMenu]="${this.showBubbleMenuDemo()}"
      [enableSlashCommands]="${this.enableSlashCommands()}"
      [slashCommandsConfig]="slashCommandsConfig"
      [showToolbar]="${this.showToolbar()}"
      [placeholder]="${this.currentPlaceholder()}"
      (contentChange)="onContentChange($event)"
    >
    </tiptap-editor>
  \`
})
export class ExampleComponent {
  content = '<p>Votre contenu initial...</p>';
  
  toolbarConfig = ${toolbarConfigStr};
  
  bubbleMenuConfig = ${bubbleMenuConfigStr};
  
  slashCommandsConfig = ${slashCommandsStr};
  
  onContentChange(content: string) {
    console.log('Content changed:', content);
  }
}`;
  });

  constructor() {
    // Initialiser la configuration des slash commands
    this.updateSlashCommandsConfig();

    // Ajouter le listener pour fermer les dropdowns
    effect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const appElement = this.elementRef.nativeElement;

        if (!appElement.contains(target)) {
          return;
        }

        // Vérifier si le clic est à l'intérieur d'un menu ouvert
        const menuSections = appElement.querySelectorAll(".dropdown-section");
        let isInsideAnyMenu = false;

        menuSections.forEach((section: Element) => {
          if (section.contains(target)) {
            isInsideAnyMenu = true;
          }
        });

        // Si le clic est à l'extérieur de tous les menus, les fermer
        if (!isInsideAnyMenu) {
          this.closeAllMenus();
        }
      };

      document.addEventListener("click", handleClickOutside);

      // Cleanup
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    });
  }

  // Méthode pour fermer tous les menus
  private closeAllMenus() {
    this.showToolbarMenu.set(false);
    this.showBubbleMenuMenu.set(false);
    this.showSlashCommandsMenu.set(false);
  }

  // Methods for demo content changes
  onDemoContentChange(content: string) {
    this.demoContent.set(content);
  }

  // Menu toggle methods
  toggleToolbarMenu() {
    this.showToolbarMenu.update((show) => !show);
    // Fermer les autres menus
    this.showBubbleMenuMenu.set(false);
    this.showSlashCommandsMenu.set(false);
  }

  toggleBubbleMenuMenu() {
    this.showBubbleMenuMenu.update((show) => !show);
    // Fermer les autres menus
    this.showToolbarMenu.set(false);
    this.showSlashCommandsMenu.set(false);
  }

  toggleSlashCommandsMenu() {
    this.showSlashCommandsMenu.update((show) => !show);
    // Fermer les autres menus
    this.showToolbarMenu.set(false);
    this.showBubbleMenuMenu.set(false);
  }

  // Toolbar configuration methods
  toggleToolbarItem(key: string) {
    this.currentToolbarConfig.update((config) => ({
      ...config,
      [key]: !(config as any)[key],
    }));
  }

  // Bubble menu configuration methods
  toggleBubbleMenuItem(key: string) {
    this.currentBubbleMenuConfig.update((config) => ({
      ...config,
      [key]: !(config as any)[key],
    }));
  }

  // Slash commands configuration methods
  toggleSlashCommand(key: string) {
    this.activeSlashCommands.update((active) => {
      const newActive = new Set(active);
      if (newActive.has(key)) {
        newActive.delete(key);
      } else {
        newActive.add(key);
      }
      return newActive;
    });

    // Mettre à jour la configuration des slash commands
    this.updateSlashCommandsConfig();
  }

  private updateSlashCommandsConfig() {
    const activeCommands = this.activeSlashCommands();
    const filteredCommands = DEFAULT_SLASH_COMMANDS.filter((command) => {
      // Mapper les commandes aux clés
      const commandKey = this.getSlashCommandKey(command);
      return activeCommands.has(commandKey);
    });

    this.currentSlashCommandsConfig.set({
      commands: filteredCommands,
    });
  }

  private getSlashCommandKey(command: SlashCommandItem): string {
    // Mapper les titres aux clés
    const keyMap: { [key: string]: string } = {
      "Titre 1": "heading1",
      "Titre 2": "heading2",
      "Titre 3": "heading3",
      "Liste à puces": "bulletList",
      "Liste numérotée": "orderedList",
      Citation: "blockquote",
      Code: "code",
      Image: "image",
      "Ligne horizontale": "horizontalRule",
    };
    return keyMap[command.title] || command.title.toLowerCase();
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

  // Toggle entre éditeur et code
  toggleCodeMode() {
    this.showCodeMode.update((show) => !show);
  }

  // Reset to defaults
  resetToDefaults() {
    this.currentToolbarConfig.set({
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
    this.currentBubbleMenuConfig.set({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      highlight: true,
      link: true,
      separator: true,
    });
    this.activeSlashCommands.set(
      new Set([
        "heading1",
        "heading2",
        "heading3",
        "bulletList",
        "orderedList",
        "blockquote",
        "code",
        "image",
        "horizontalRule",
      ])
    );
    this.updateSlashCommandsConfig();
    this.showToolbar.set(true);
    this.showBubbleMenuDemo.set(true);
    this.enableSlashCommands.set(true);
    this.closeAllMenus();
  }

  clearContent() {
    this.demoContent.set("<p></p>");
  }

  // Copy code functionality
  copyCode() {
    const code = this.generatedCode();
    navigator.clipboard.writeText(code);

    // Feedback visuel (optionnel)
    console.log("Code copié dans le presse-papiers !");
  }

  // Utility methods
  isToolbarItemActive(key: string): boolean {
    const config = this.currentToolbarConfig();
    return !!(config as any)[key];
  }

  isBubbleMenuItemActive(key: string): boolean {
    const config = this.currentBubbleMenuConfig();
    return !!(config as any)[key];
  }

  isSlashCommandActive(key: string): boolean {
    return this.activeSlashCommands().has(key);
  }

  getToolbarActiveCount(): number {
    const config = this.currentToolbarConfig();
    return Object.values(config).filter(Boolean).length;
  }

  getBubbleMenuActiveCount(): number {
    const config = this.currentBubbleMenuConfig();
    return Object.values(config).filter(Boolean).length;
  }

  getSlashCommandsActiveCount(): number {
    return this.activeSlashCommands().size;
  }

  // Utility for JSON display
  JSON = JSON;

  // Toggle sidebar avec animation de transformation
  toggleSidebar() {
    const currentState = this.showSidebar();

    if (currentState) {
      // Fermeture du sidebar
      this.showSidebar.set(false);
    } else {
      // Ouverture avec animation de transformation
      this.isTransitioning.set(true);

      // Étape 1: Afficher l'élément de transition et démarrer l'expansion
      setTimeout(() => {
        const transitionElement = this.elementRef.nativeElement.querySelector(
          ".transition-element"
        );
        if (transitionElement) {
          transitionElement.classList.add("expanding");
        }
      }, 10);

      // Étape 2: Après l'animation, remplacer directement par le sidebar
      setTimeout(() => {
        this.isTransitioning.set(false);
        this.showSidebar.set(true);
      }, 650);
    }
  }

  // Méthode pour colorer le code
  highlightCode(code: string): string {
    // Retourner le code brut sans coloration pour éviter les problèmes d'affichage
    return code;
  }
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
