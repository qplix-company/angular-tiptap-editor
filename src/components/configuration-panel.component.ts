import { Component, inject, ElementRef, effect, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ConfigSectionComponent } from "./config-section.component";
import { HeightConfigComponent } from "./height-config.component";
import { EditorConfigurationService } from "../services/editor-configuration.service";
import { TiptapI18nService } from "angular-tiptap-editor";
import { AppI18nService } from "../services/app-i18n.service";
import {
  createBubbleMenuItems,
  createSlashCommandItems,
  createToolbarItems,
} from "../config/editor-items.config";

@Component({
  selector: "app-configuration-panel",
  standalone: true,
  imports: [CommonModule, ConfigSectionComponent, HeightConfigComponent],
  template: `
    <!-- Sidebar de configuration avec contenu visible pendant l'animation -->
    <aside
      class="sidebar"
      [class.hidden]="
        !editorState().showSidebar && !editorState().isTransitioning
      "
      [class.expanding]="editorState().isTransitioning"
    >
      <div class="sidebar-container">
        <!-- Header du sidebar -->
        <div class="sidebar-header">
          <div class="header-content">
            <div class="logo">
              <span class="material-symbols-outlined">tune</span>
              <h1>{{ appI18n.ui().configuration }}</h1>
            </div>
            <div class="header-actions">
              <button
                class="panel-btn secondary"
                (click)="resetToDefaults()"
                [title]="appI18n.tooltips().resetConfiguration"
              >
                <span class="material-symbols-outlined">restart_alt</span>
              </button>
              <button
                class="panel-btn danger"
                (click)="toggleSidebar()"
                [title]="appI18n.tooltips().closeSidebar"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <!-- Status bar intégré -->
          <div class="status-bar">
            <div class="status-item" [class.active]="editorState().showToolbar">
              <span class="material-symbols-outlined">build</span>
              <span>{{ toolbarActiveCount() }}</span>
            </div>
            <div
              class="status-item"
              [class.active]="editorState().showBubbleMenu"
            >
              <span class="material-symbols-outlined">chat_bubble</span>
              <span>{{ bubbleMenuActiveCount() }}</span>
            </div>
            <div
              class="status-item"
              [class.active]="editorState().enableSlashCommands"
            >
              <span class="material-symbols-outlined">flash_on</span>
              <span>{{ slashCommandsActiveCount() }}</span>
            </div>
          </div>
        </div>

        <!-- Configuration sections -->
        <div class="config-sections">
          <!-- Toolbar -->
          <app-config-section
            [title]="appI18n.config().toolbar"
            icon="build"
            [items]="toolbarItems()"
            [isEnabled]="editorState().showToolbar"
            [activeCount]="toolbarActiveCount()"
            [isDropdownOpen]="menuState().showToolbarMenu"
            [itemCheckFunction]="isToolbarItemActive.bind(this)"
            (toggleEnabled)="toggleToolbar()"
            (toggleDropdown)="toggleToolbarMenu()"
            (toggleItem)="toggleToolbarItem($event)"
          />

          <!-- Bubble Menu -->
          <app-config-section
            [title]="appI18n.config().bubbleMenu"
            icon="chat_bubble"
            [items]="bubbleMenuItems()"
            [isEnabled]="editorState().showBubbleMenu"
            [activeCount]="bubbleMenuActiveCount()"
            [isDropdownOpen]="menuState().showBubbleMenuMenu"
            [itemCheckFunction]="isBubbleMenuItemActive.bind(this)"
            (toggleEnabled)="toggleBubbleMenu()"
            (toggleDropdown)="toggleBubbleMenuMenu()"
            (toggleItem)="toggleBubbleMenuItem($event)"
          />

          <!-- Slash Commands -->
          <app-config-section
            [title]="appI18n.config().slashCommands"
            icon="flash_on"
            [items]="slashCommandItems()"
            [isEnabled]="editorState().enableSlashCommands"
            [activeCount]="slashCommandsActiveCount()"
            [isDropdownOpen]="menuState().showSlashCommandsMenu"
            [itemCheckFunction]="isSlashCommandActive.bind(this)"
            (toggleEnabled)="toggleSlashCommands()"
            (toggleDropdown)="toggleSlashCommandsMenu()"
            (toggleItem)="toggleSlashCommand($event)"
          />

          <!-- Height Configuration -->
          <app-height-config />
        </div>
      </div>
    </aside>

    <!-- Bouton d'ouverture simple -->
    @if (!editorState().showSidebar && !editorState().isTransitioning) {
    <button
      class="open-sidebar-btn"
      (click)="toggleSidebar()"
      [title]="appI18n.tooltips().toggleSidebar"
    >
      <span class="material-symbols-outlined">tune</span>
    </button>
    }
  `,
  styles: [
    `
      /* Sidebar styles avec animation sophistiquée */
      .sidebar {
        position: fixed;
        top: 2rem;
        right: var(--panel-right-offset);
        width: var(--panel-width);
        height: var(--panel-height);
        background: transparent;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 0;
        box-sizing: border-box;
        z-index: 100;
        opacity: 1;
        transform: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .sidebar.hidden {
        display: none;
      }

      /* Animation d'expansion de la sidebar avec contenu visible */
      .sidebar.expanding {
        animation: sidebarExpand 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)
          forwards;
      }

      @keyframes sidebarExpand {
        0% {
          right: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 16px;
          overflow: hidden;
          opacity: 0.8;
        }
        50% {
          right: var(--panel-right-offset);
          width: var(--panel-width);
          height: var(--panel-height);
          border-radius: 16px;
          overflow: hidden;
          opacity: 0.95;
        }
        100% {
          right: var(--panel-right-offset);
          width: var(--panel-width);
          height: var(--panel-height);
          border-radius: 16px;
          overflow: visible;
          opacity: 1;
        }
      }

      .sidebar-container {
        background: white;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s;
      }

      .sidebar.expanding .sidebar-container {
        opacity: 1;
        transform: translateY(0);
      }

      .sidebar:not(.expanding) .sidebar-container {
        opacity: 1;
        transform: translateY(0);
      }

      .sidebar-header {
        background: #f8f9fa;
        border-bottom: 1px solid #e2e8f0;
        border-radius: 16px 16px 0 0;
        flex-shrink: 0;
      }

      .header-content {
        padding: 1.25rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
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
      }

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
      }

      .panel-btn.secondary {
        color: #64748b;
      }

      .panel-btn.danger {
        color: #ef4444;
      }

      .panel-btn:hover {
        background: #f1f5f9;
      }

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
        background: #f8f9fa;
        flex: 1;
        justify-content: center;
      }

      .status-item.active {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }

      .config-sections {
        flex: 1;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .config-sections::-webkit-scrollbar {
        display: none;
      }

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
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        transform: scale(1);
      }

      .open-sidebar-btn:hover {
        color: #6366f1;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
        transform: scale(1.05);
      }

      .open-sidebar-btn:active {
        transform: scale(0.95);
      }

      .open-sidebar-btn:hover {
        color: #6366f1;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
      }

      .open-sidebar-btn .material-symbols-outlined {
        font-size: 24px;
      }

      /* Animation sophistiquée maintenue avec CSS pur */

      /* Styles pour les contrôles de configuration */
      .config-controls {
        padding: 1rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      .form-select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.875rem;
        background: white;
        color: #374151;
        outline: none;
        transition: border-color 0.2s ease;
      }

      .form-select:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-select:hover {
        border-color: #9ca3af;
      }

      .form-select option {
        padding: 0.5rem;
      }
    `,
  ],
})
export class ConfigurationPanelComponent {
  readonly configService = inject(EditorConfigurationService);
  private elementRef = inject(ElementRef);
  private i18nService = inject(TiptapI18nService);
  readonly appI18n = inject(AppI18nService);

  // Signaux depuis le service
  readonly editorState = this.configService.editorState;
  readonly menuState = this.configService.menuState;
  readonly toolbarActiveCount = this.configService.toolbarActiveCount;
  readonly bubbleMenuActiveCount = this.configService.bubbleMenuActiveCount;
  readonly slashCommandsActiveCount =
    this.configService.slashCommandsActiveCount;

  // Configuration des items avec traductions
  readonly toolbarItems = computed(() =>
    createToolbarItems(this.appI18n.items())
  );
  readonly bubbleMenuItems = computed(() =>
    createBubbleMenuItems(this.appI18n.items())
  );
  readonly slashCommandItems = computed(() =>
    createSlashCommandItems(this.appI18n.items())
  );

  constructor() {
    // Ajouter le listener pour fermer les dropdowns
    effect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        const appElement = this.elementRef.nativeElement;

        if (!appElement.contains(target)) {
          return;
        }

        // Check if click is inside an open menu
        const menuSections = appElement.querySelectorAll(".dropdown-section");
        let isInsideAnyMenu = false;

        menuSections.forEach((section: Element) => {
          if (section.contains(target)) {
            isInsideAnyMenu = true;
          }
        });

        // If click is outside all menus, close them
        if (!isInsideAnyMenu) {
          this.configService.closeAllMenus();
        }
      };

      document.addEventListener("click", handleClickOutside);

      // Cleanup
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    });

    // Effect pour démarrer l'animation d'expansion
    effect(() => {
      const isTransitioning = this.editorState().isTransitioning;

      if (isTransitioning) {
        // L'animation CSS se déclenche automatiquement via la classe .expanding
        // Pas besoin de manipulation DOM complexe
      }
    });
  }

  // Methods for toolbar
  toggleToolbar() {
    this.configService.updateEditorState({
      showToolbar: !this.editorState().showToolbar,
    });
  }

  toggleToolbarMenu() {
    this.configService.updateMenuState({
      showToolbarMenu: !this.menuState().showToolbarMenu,
      showBubbleMenuMenu: false,
      showSlashCommandsMenu: false,
    });
  }

  toggleToolbarItem(key: string) {
    this.configService.toggleToolbarItem(key);
  }

  isToolbarItemActive(key: string): boolean {
    return this.configService.isToolbarItemActive(key);
  }

  // Methods for bubble menu
  toggleBubbleMenu() {
    this.configService.updateEditorState({
      showBubbleMenu: !this.editorState().showBubbleMenu,
    });
  }

  toggleBubbleMenuMenu() {
    this.configService.updateMenuState({
      showBubbleMenuMenu: !this.menuState().showBubbleMenuMenu,
      showToolbarMenu: false,
      showSlashCommandsMenu: false,
    });
  }

  toggleBubbleMenuItem(key: string) {
    this.configService.toggleBubbleMenuItem(key);
  }

  isBubbleMenuItemActive(key: string): boolean {
    return this.configService.isBubbleMenuItemActive(key);
  }

  // Methods for slash commands
  toggleSlashCommands() {
    this.configService.updateEditorState({
      enableSlashCommands: !this.editorState().enableSlashCommands,
    });
  }

  toggleSlashCommandsMenu() {
    this.configService.updateMenuState({
      showSlashCommandsMenu: !this.menuState().showSlashCommandsMenu,
      showToolbarMenu: false,
      showBubbleMenuMenu: false,
    });
  }

  toggleSlashCommand(key: string) {
    this.configService.toggleSlashCommand(key);
  }

  isSlashCommandActive(key: string): boolean {
    return this.configService.isSlashCommandActive(key);
  }

  // General methods
  toggleSidebar() {
    const currentState = this.editorState().showSidebar;

    if (currentState) {
      // Fermeture du sidebar
      this.configService.updateEditorState({ showSidebar: false });
    } else {
      // Ouverture avec animation et contenu visible
      this.configService.updateEditorState({ isTransitioning: true });

      // Après l'animation CSS, finaliser l'état
      setTimeout(() => {
        this.configService.updateEditorState({
          isTransitioning: false,
          showSidebar: true,
        });
      }, 800); // Durée de l'animation CSS
    }
  }

  resetToDefaults() {
    this.configService.resetToDefaults();
  }
}
