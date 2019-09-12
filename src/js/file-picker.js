/**
 * --------------------------------------------------------------------------
 * Bootstrap File Picker (v0.0.1): file-picker.js
 * --------------------------------------------------------------------------
 */

import $ from 'jquery'

const Default = {
    multiple    : false,
    type        : '*/*',
    btnUpload   : 'Upload',
    thumbnails  : null,
    search      : null,
    upload      : null,
    selected    : null
}

class FilePicker {

    constructor(config){
        this._config    = this._getConfig(config)
        this._el        = {}
        
        this._files     = []
        this._items     = []
        this._paths     = []

        this._query     = ''
        this._uploader  = 0
        this._timer     = null

        this._makeDrawer()
        this._addElementsListener()

        $(this._el.drawer).drawer('show');
    }

    // private

    _addElementsListener(){
        // drawer showing
        $(this._el.drawer).on('show.bs.drawer', e => {
            this._footerHide()
        })
        
        // drawer shown
        $(this._el.drawer).on('shown.bs.drawer', e => {

            // calculate the spinner position
            if(this._el.dhSearchInput){
                let inpWidth    = this._el.dhSearchInput.offsetWidth
                let inpPadRight = parseFloat( $(this._el.dhSearchInput).css('padding-left') )
                this._el.dhSearchSpinner.style.left = ( inpWidth - ( inpPadRight * 2.5 ) ) + 'px'

                this._spinnerHide()
                this._el.dhSearchInput.focus()
            }

            // find preset files
            this._searchQuery('')
        })

        // drawer hiding
        $(this._el.drawer).on('hide.bs.drawer', e => {
            if(this._uploader)
                e.preventDefault()
        })

        // drawer hidden
        $(this._el.drawer).on('hidden.bs.drawer', e => {
            $(this._el.drawer).remove()
        })

        // input search
        if(this._el.dhSearchInput){
            $(this._el.dhSearchInput).on('input', e => {
                if(this._timer)
                    clearTimeout(this._timer)

                this._query = this._el.dhSearchInput.value
                this._timer = setTimeout(q => this._searchQuery(q), 500, this._query)
            })
        }

        // file list click
        $(this._el.drawerBody).on('click', '.filepicker-item-selectable', e => {
            let item = e.currentTarget

            if(!this._config.multiple){
                $(this._el.drawerBody)
                    .children('.filepicker-item-active')
                    .removeClass('filepicker-item-active')
            }

            let path = $(item).data('filepicker.item').path

            if(item.classList.toggle('filepicker-item-active')){
                this._paths.push(path)
            }else{
                this._paths.splice(this._paths.indexOf(path), 1)
            }

            this._footerUpdate()
        })

        // file list error click
        $(this._el.drawerBody).on('click', '.filepicker-item-error', e => {
            let item = e.currentTarget
            item.style.opacity = 0
            setTimeout(item => $(item).remove(), 300, item)
        })

        // clicking the select button
        $(this._el.dfBtnSelect).click(e => {
            let result = []
            $(this._el.drawerBody)
                .children('.filepicker-item-active')
                .each((i,e) => result.push( $(e).data('filepicker.item') ))

            if(this._config.selected)
                this._config.selected.call(this, result)

            $(this._el.drawer).drawer('hide')
        })

        if(this._el.dhUploadInput){
            $(this._el.dhUploadInput).on('change', e => {
                let files = this._el.dhUploadInput.files
                if(!files.length)
                    return

                this._clearResult()

                for(let i=0; i<files.length; i++){
                    let file = files[i]
                    let el   = this._renderItem(file, true, null, false, false)
                    let prog = $(el).find('.progress-bar').get(0)

                    // start upload the file
                    this._uploader++
                    this._footerUpdate()
                    this._config.upload.call(this, file, prog, res => {
                        this._uploader--

                        if(typeof res === 'string'){
                            res = this._hs(res)
                            $(prog).parent().replaceWith(`<small class="text-danger">${res}</small>`)
                            el.classList.add('filepicker-item-error')
                        }else{
                            let nel = this._renderItem(res, false, el, false, true)

                            if(nel)
                                nel.click()
                            else
                                $(el).remove()
                        }
                        this._footerUpdate()
                    })
                }
                this._el.dhUploadForm.reset()
            })
        }
    }

    _clearResult(){
        $(this._el.drawerBody)
            .find('.filepicker-item-clearable')
            .not('.filepicker-item-active')
            .each((i,e) => $(e).remove())
        
        this._footerUpdate()
    }

    _getConfig(config){
        let conf = {}
        for(let k in Default)
            conf[k] = typeof config[k] === 'undefined' ? Default[k] : config[k]
        return conf
    }

    _hs(text){
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
    }

    _makeDrawer(){
        let header      = ''
        let multiText   = this._config.multiple ? ' multiple' : ''

        // Searchable
        if(this._config.search){
            let upform = ``

            // Uploadable
            if(this._config.upload){
                upform = `
                    <form class="input-group-append" data-el="dh-upload-form">
                        <label class="btn btn-outline-secondary" data-el="dh-upload-label">
                            <input type="file" accept="${this._config.type}" data-el="dh-upload-input"${multiText}>
                        </label>
                    </form>`
            }

            header = `
                <div class="form-group">
                    <div class="input-group">
                        <input type="search" class="form-control" placeholder="Search" aria-label="Search" data-el="dh-search-input">
                        ${upform}
                    </div>
                    <div class="spinner-border spinner-border-sm text-secondary" role="status" data-el="dh-search-spinner"></div>
                </div>`

        // Uploadable only
        }else if(this._config.upload){
            header = `
                <form data-el="dh-upload-form">
                    <label class="btn btn-block btn-outline-primary" data-el="dh-upload-label">
                        <input type="file" accept="${this._config.type}" data-el="dh-upload-input"${multiText}>
                    </label>
                </form>`
        }

        let tmpl = `
            <div class="drawer slide drawer-right filepicker-container">
                <div class="drawer-content drawer-content-scrollable">
                    <div class="drawer-header">${header}</div>
                    <div class="drawer-body" data-el="drawer-body"></div>
                    <div class="drawer-footer" data-el="drawer-footer">
                        <button class="btn btn-primary btn-block" data-el="df-btn-select">
                            Select
                        </button>
                    </div>
                </div>
            </div>`;

        this._el.drawer = $(tmpl).appendTo(document.body).get(0)

        // find identified elements
        $(this._el.drawer).find('[data-el]').each((i,e) => {
            let name = e.dataset.el.replace(/\-[a-z]/g, m => m[1].toUpperCase())
            this._el[name] = e
        })

        // add upload label
        $(this._el.dhUploadLabel).append(this._config.btnUpload)
    }

    _renderItem(item, uploader=false, replacer=null, removable=true, selectable=true){
        if(!uploader){
            if(this._paths.includes(item.path))
                return
        }

        let safe = {
            name  : this._hs(item.name),
            type  : this._hs(item.type),
            thumb : item.thumb || this._config.thumbnails
        }

        let clss = ' filepicker-item'
        let progress = ''
        
        if(uploader){
            clss+= ' filepicker-item-uploader'
            progress = `
                <div class="progress">
                    <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:0%"></div>
                </div>`
        }

        if(removable)
            clss+= ' filepicker-item-clearable'
        
        if(selectable)
            clss+= ' filepicker-item-selectable'

        let tmpl = `
            <div class="media${clss}" title="${safe.name}">
                <img src="${safe.thumb}" alt="#" width="48" height="48">
                <div class="media-body">
                    <h6>${safe.name}</h6>
                    <small class="text-muted">${safe.type}</small>
                    ${progress}
                </div>
            </div>`

        let el = $(tmpl).get(0)

        if(uploader){
            let img = $(el).children('img').get(0)
            if(/image\//.test(safe.type)){
                let reader = new FileReader()
                reader.onload = e => img.src = e.target.result
                reader.readAsDataURL(item)
            }
        }else{
            $(el).data('filepicker.item', item)
        }

        if(replacer)
            $(replacer).replaceWith(el)
        else
            $(this._el.drawerBody).append(el)

        return el
    }

    _searchQuery(query){
        this._clearResult()
        this._spinnerShow()

        if(!this._config.search)
            return

        this._config.search(query, this._config.type, res => {
            if(query != this._query)
                return
            this._spinnerHide()
            
            if(!res)
                return

            res.forEach(item => this._renderItem(item))
        })
    }

    // Toogler
    _footerHide(){
        this._el.drawerFooter.style.display = 'none'
    }
    _footerShow(){
        this._el.drawerFooter.style.display = 'flex'
    }
    _footerUpdate(){
        if(this._uploader)
            return this._footerHide()

        if($(this._el.drawerBody).children('.filepicker-item-active').length)
            this._footerShow()
        else
            this._footerHide()
    }

    _spinnerHide(){
        if(this._el.dhSearchSpinner)
            this._el.dhSearchSpinner.style.display = 'none'
    }
    _spinnerShow(){
        if(this._el.dhSearchSpinner)
            this._el.dhSearchSpinner.style.display = 'block'
    }
}

window.FilePicker = FilePicker
export default FilePicker