import { Component, OnInit, Input, HostBinding, HostListener, Inject, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { NgfmFile } from '../models/ngfm-file';
import { NgfmFolder } from '../models/ngfm-folder';
import { NgfmConfig } from '../models/ngfm-config';
import { NgfmConnector } from '../connectors/ngfm-connector';
import { NGFM_CONNECTOR } from '../connectors/constants';
import { NgfmItem } from '../models/ngfm-item';

@Component({
  selector: 'ngfm-browser-item-tools',
  templateUrl: './ngfm-browser-item-tools.component.html',
  styleUrls: ['./ngfm-browser-item-tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgfmBrowserItemToolsComponent implements OnInit, OnChanges {
  @Input() items: NgfmItem[];
  @Input() isFile = false;
  @Input() text = '';
  @Input() config: NgfmConfig;
  menuItems: any[] = [];
  @HostBinding('class.ngfm-browser-item-tools') private _hostClass = true;
  @Output() selectionChange: EventEmitter<NgfmItem> = new EventEmitter();
  @HostListener('click', ['$event'])
  clicked(ev) {
    ev.stopPropagation();
    ev.stopImmediatePropagation();
  }
  constructor(
    @Inject(NGFM_CONNECTOR) private connector: NgfmConnector
  ) { }
  ngOnInit() {
    this.buildMenu();
  }
  ngOnChanges(changes: SimpleChanges) {
    if ('items' in changes) {
      this.buildMenu();
    }
  }
  buildMenu() {
    /**
     *     
     createFile?= true;
    editFile?= true;
    removeFile?= true;
    createFolder?= true;
    editFolder?= true;
    removeFolder?= true;
     */
    this.menuItems = (this.isFile ?
      [
        {
          isMulti: true,
          perms: 'removeFile',
          text: this.config.messages.DELETE,
          action: () => this.items.forEach(item => this.connector.rm(item as NgfmFile).subscribe())
        },
        {
          isMulti: false,
          perms: 'editFile',
          text: this.config.messages.RENAME,
          action: () => this.rename(this.items[0])
        },
      ] :
      [
        {
          isMulti: true,
          perms: 'removeFolder',
          text: this.config.messages.DELETE,
          action: () => this.items.forEach(item => this.connector.rmDir(item as NgfmFolder).subscribe())
        },
        {
          isMulti: false,
          perms: 'editFolder',
          text: this.config.messages.RENAME,
          action: () => this.rename(this.items[0])
        }
      ]).filter(menuItem => {
        return this.items.length && this.config.perms[menuItem.perms] && (menuItem.isMulti || this.items.length === 1);
      });
  }
  rename(item: NgfmItem) {
    const newName = prompt(this.config.messages.RENAME, item.isFile ? item.name.replace(/\.[^\.]*$/, '') : '');
    if (newName) {
      this.connector.rename(item, newName + (item.isFile ? '.' + (item as NgfmFile).extension : '')).subscribe();
    }
  }

}
