/*!
  * Bootstrap File Picker v0.0.2 (https://iqbalfn.github.io/bootstrap-file-picker/)
  * Copyright 2019 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/bootstrap-file-picker/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('jquery')) :
    typeof define === 'function' && define.amd ? define(['exports', 'jquery'], factory) :
    (global = global || self, factory(global['bootstrap-file-picker'] = {}, global.jQuery));
}(this, function (exports, $) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    /**
     * --------------------------------------------------------------------------
     * Bootstrap File Picker (v0.0.1): file-picker.js
     * --------------------------------------------------------------------------
     */
    var Default = {
      multiple: false,
      type: '*/*',
      btnUpload: 'Upload',
      thumbnails: null,
      search: null,
      upload: null,
      selected: null
    };

    var FilePicker =
    /*#__PURE__*/
    function () {
      function FilePicker(config) {
        this._config = this._getConfig(config);
        this._el = {};
        this._files = [];
        this._items = [];
        this._paths = [];
        this._query = '';
        this._uploader = 0;
        this._timer = null;

        this._makeDrawer();

        this._addElementsListener();

        $(this._el.drawer).drawer('show');
      } // private


      var _proto = FilePicker.prototype;

      _proto._addElementsListener = function _addElementsListener() {
        var _this = this;

        // drawer showing
        $(this._el.drawer).on('show.bs.drawer', function (e) {
          _this._footerHide();
        }); // drawer shown

        $(this._el.drawer).on('shown.bs.drawer', function (e) {
          // calculate the spinner position
          if (_this._el.dhSearchInput) {
            var inpWidth = _this._el.dhSearchInput.offsetWidth;
            var inpPadRight = parseFloat($(_this._el.dhSearchInput).css('padding-left'));
            _this._el.dhSearchSpinner.style.left = inpWidth - inpPadRight * 2.5 + 'px';

            _this._spinnerHide();

            _this._el.dhSearchInput.focus();
          } // find preset files


          _this._searchQuery('');
        }); // drawer hiding

        $(this._el.drawer).on('hide.bs.drawer', function (e) {
          if (_this._uploader) e.preventDefault();
        }); // drawer hidden

        $(this._el.drawer).on('hidden.bs.drawer', function (e) {
          $(_this._el.drawer).remove();
        }); // input search

        if (this._el.dhSearchInput) {
          $(this._el.dhSearchInput).on('input', function (e) {
            if (_this._timer) clearTimeout(_this._timer);
            _this._query = _this._el.dhSearchInput.value;
            _this._timer = setTimeout(function (q) {
              return _this._searchQuery(q);
            }, 500, _this._query);
          });
        } // file list click


        $(this._el.drawerBody).on('click', '.filepicker-item-selectable', function (e) {
          var item = e.currentTarget;

          if (!_this._config.multiple) {
            $(_this._el.drawerBody).children('.filepicker-item-active').removeClass('filepicker-item-active');
          }

          var path = $(item).data('filepicker.item').path;

          if (item.classList.toggle('filepicker-item-active')) {
            _this._paths.push(path);
          } else {
            _this._paths.splice(_this._paths.indexOf(path), 1);
          }

          _this._footerUpdate();
        }); // file list error click

        $(this._el.drawerBody).on('click', '.filepicker-item-error', function (e) {
          var item = e.currentTarget;
          item.style.opacity = 0;
          setTimeout(function (item) {
            return $(item).remove();
          }, 300, item);
        }); // clicking the select button

        $(this._el.dfBtnSelect).click(function (e) {
          var result = [];
          $(_this._el.drawerBody).children('.filepicker-item-active').each(function (i, e) {
            return result.push($(e).data('filepicker.item'));
          });
          if (_this._config.selected) _this._config.selected.call(_this, result);
          $(_this._el.drawer).drawer('hide');
        });

        if (this._el.dhUploadInput) {
          $(this._el.dhUploadInput).on('change', function (e) {
            var files = _this._el.dhUploadInput.files;
            if (!files.length) return;

            _this._clearResult();

            var _loop = function _loop(i) {
              var file = files[i];

              var el = _this._renderItem(file, true, null, false, false);

              var prog = $(el).find('.progress-bar').get(0); // start upload the file

              _this._uploader++;

              _this._footerUpdate();

              _this._config.upload.call(_this, file, prog, function (res) {
                _this._uploader--;

                if (typeof res === 'string') {
                  res = _this._hs(res);
                  $(prog).parent().replaceWith("<small class=\"text-danger\">" + res + "</small>");
                  el.classList.add('filepicker-item-error');
                } else {
                  var nel = _this._renderItem(res, false, el, false, true);

                  if (nel) nel.click();else $(el).remove();
                }

                _this._footerUpdate();
              });
            };

            for (var i = 0; i < files.length; i++) {
              _loop(i);
            }

            _this._el.dhUploadForm.reset();
          });
        }
      };

      _proto._clearResult = function _clearResult() {
        $(this._el.drawerBody).find('.filepicker-item-clearable').not('.filepicker-item-active').each(function (i, e) {
          return $(e).remove();
        });

        this._footerUpdate();
      };

      _proto._getConfig = function _getConfig(config) {
        var conf = {};

        for (var k in Default) {
          conf[k] = typeof config[k] === 'undefined' ? Default[k] : config[k];
        }

        return conf;
      };

      _proto._hs = function _hs(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      };

      _proto._makeDrawer = function _makeDrawer() {
        var _this2 = this;

        var header = '';
        var multiText = this._config.multiple ? ' multiple' : ''; // Searchable

        if (this._config.search) {
          var upform = ""; // Uploadable

          if (this._config.upload) {
            upform = "\n                    <form class=\"input-group-append\" data-el=\"dh-upload-form\">\n                        <label class=\"btn btn-outline-secondary\" data-el=\"dh-upload-label\">\n                            <input type=\"file\" accept=\"" + this._config.type + "\" data-el=\"dh-upload-input\"" + multiText + ">\n                        </label>\n                    </form>";
          }

          header = "\n                <div class=\"form-group\">\n                    <div class=\"input-group\">\n                        <input type=\"search\" class=\"form-control\" placeholder=\"Search\" aria-label=\"Search\" data-el=\"dh-search-input\">\n                        " + upform + "\n                    </div>\n                    <div class=\"spinner-border spinner-border-sm text-secondary\" role=\"status\" data-el=\"dh-search-spinner\"></div>\n                </div>"; // Uploadable only
        } else if (this._config.upload) {
          header = "\n                <form data-el=\"dh-upload-form\">\n                    <label class=\"btn btn-block btn-outline-primary\" data-el=\"dh-upload-label\">\n                        <input type=\"file\" accept=\"" + this._config.type + "\" data-el=\"dh-upload-input\"" + multiText + ">\n                    </label>\n                </form>";
        }

        var tmpl = "\n            <div class=\"drawer slide drawer-right filepicker-container\">\n                <div class=\"drawer-content drawer-content-scrollable\">\n                    <div class=\"drawer-header\">" + header + "</div>\n                    <div class=\"drawer-body\" data-el=\"drawer-body\"></div>\n                    <div class=\"drawer-footer\" data-el=\"drawer-footer\">\n                        <button class=\"btn btn-primary btn-block\" data-el=\"df-btn-select\">\n                            Select\n                        </button>\n                    </div>\n                </div>\n            </div>";
        this._el.drawer = $(tmpl).appendTo(document.body).get(0); // find identified elements

        $(this._el.drawer).find('[data-el]').each(function (i, e) {
          var name = e.dataset.el.replace(/\-[a-z]/g, function (m) {
            return m[1].toUpperCase();
          });
          _this2._el[name] = e;
        }); // add upload label

        $(this._el.dhUploadLabel).append(this._config.btnUpload);
      };

      _proto._renderItem = function _renderItem(item, uploader, replacer, removable, selectable) {
        if (uploader === void 0) {
          uploader = false;
        }

        if (replacer === void 0) {
          replacer = null;
        }

        if (removable === void 0) {
          removable = true;
        }

        if (selectable === void 0) {
          selectable = true;
        }

        if (!uploader) {
          if (this._paths.includes(item.path)) return;
        }

        var safe = {
          name: this._hs(item.name),
          type: this._hs(item.type),
          thumb: item.thumb || this._config.thumbnails
        };
        var clss = ' filepicker-item';
        var progress = '';

        if (uploader) {
          clss += ' filepicker-item-uploader';
          progress = "\n                <div class=\"progress\">\n                    <div class=\"progress-bar progress-bar-striped progress-bar-animated\" style=\"width:0%\"></div>\n                </div>";
        }

        if (removable) clss += ' filepicker-item-clearable';
        if (selectable) clss += ' filepicker-item-selectable';
        var tmpl = "\n            <div class=\"media" + clss + "\" title=\"" + safe.name + "\">\n                <img src=\"" + safe.thumb + "\" alt=\"#\" width=\"48\" height=\"48\">\n                <div class=\"media-body\">\n                    <h6>" + safe.name + "</h6>\n                    <small class=\"text-muted\">" + safe.type + "</small>\n                    " + progress + "\n                </div>\n            </div>";
        var el = $(tmpl).get(0);

        if (uploader) {
          var img = $(el).children('img').get(0);

          if (/image\//.test(safe.type)) {
            var reader = new FileReader();

            reader.onload = function (e) {
              return img.src = e.target.result;
            };

            reader.readAsDataURL(item);
          }
        } else {
          $(el).data('filepicker.item', item);
        }

        if (replacer) $(replacer).replaceWith(el);else $(this._el.drawerBody).append(el);
        return el;
      };

      _proto._searchQuery = function _searchQuery(query) {
        var _this3 = this;

        this._clearResult();

        this._spinnerShow();

        this._config.search(query, this._config.type, function (res) {
          if (query != _this3._query) return;

          _this3._spinnerHide();

          if (!res) return;
          res.forEach(function (item) {
            return _this3._renderItem(item);
          });
        });
      } // Toogler
      ;

      _proto._footerHide = function _footerHide() {
        this._el.drawerFooter.style.display = 'none';
      };

      _proto._footerShow = function _footerShow() {
        this._el.drawerFooter.style.display = 'flex';
      };

      _proto._footerUpdate = function _footerUpdate() {
        if (this._uploader) return this._footerHide();
        if ($(this._el.drawerBody).children('.filepicker-item-active').length) this._footerShow();else this._footerHide();
      };

      _proto._spinnerHide = function _spinnerHide() {
        this._el.dhSearchSpinner.style.display = 'none';
      };

      _proto._spinnerShow = function _spinnerShow() {
        this._el.dhSearchSpinner.style.display = 'block';
      };

      return FilePicker;
    }();

    window.FilePicker = FilePicker;

    exports.FilePicker = FilePicker;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=bootstrap-file-picker.js.map
