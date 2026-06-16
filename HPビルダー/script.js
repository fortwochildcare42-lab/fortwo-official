/* ============================================
   For Two — script.js 完全版 v4.1
   37.7MB動画対応 + 全機能統合
   ============================================ */

class ForTwoBuilder {
    constructor() {
        this.isEditing   = false;
        this.storageKey  = 'fortwo_site_data';
        this.mediaKey    = 'fortwo_media_data';
        this.templateKey = 'fortwo_template_pikkas';
        this.versionKey  = 'fortwo_element_count'; // 要素数チェック用

        /* DOM要素取得 */
        this.editBtn         = document.getElementById('editModeBtn');
        this.previewBtn      = document.getElementById('previewBtn');
        this.exportBtn       = document.getElementById('exportBtn');
        this.templateBtn     = document.getElementById('templateBtn');
        this.loadTemplateBtn = document.getElementById('loadTemplateBtn');
        this.mobileBtn       = document.getElementById('mobilePreviewBtn');

        /* メディア編集用 */
        this._fileInput      = this._createFileInput();
        this._activeMediaEl  = null;
        this._mobileMode     = false;

        this.init();
    }

    /* ============================================
       初期化
       ============================================ */
    init() {
        this.bindEvents();
        this.loadData();
        this.loadMediaData();
        this.initScrollEffects();
        this.initRevealAnimations();
        this.initHamburgerMenu();
        this.initSmoothScroll();
        
        console.log('✅ For Two Builder v4.1 起動完了');
    }

    /* ============================================
       イベント登録
       ============================================ */
    bindEvents() {
        if (this.editBtn)         this.editBtn.addEventListener('click', () => this.toggleEditMode());
        if (this.previewBtn)      this.previewBtn.addEventListener('click', () => this.openPreview());
        if (this.exportBtn)       this.exportBtn.addEventListener('click', () => this.exportHTML());
        if (this.templateBtn)     this.templateBtn.addEventListener('click', () => this.saveTemplate());
        if (this.loadTemplateBtn) this.loadTemplateBtn.addEventListener('click', () => this.loadTemplate());
        if (this.mobileBtn)       this.mobileBtn.addEventListener('click', () => this.toggleMobilePreview());

        // リセットボタン
        const resetBtn = document.getElementById('resetDataBtn');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetAllData());
    }

    /* ============================================
       スクロール・アニメーション系
       ============================================ */
    initScrollEffects() {
        const nav = document.getElementById('siteNav');
        if (!nav) return;
        
        const onScroll = () => {
            const scrolled = window.scrollY > 80;
            nav.classList.toggle('scrolled', scrolled);
        };
        
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    initRevealAnimations() {
        const targets = document.querySelectorAll('.reveal-up');
        
        if (!('IntersectionObserver' in window)) {
            // IntersectionObserver非対応の場合は即座に表示
            targets.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.12, 
            rootMargin: '-40px 0px' 
        });

        targets.forEach(el => observer.observe(el));
    }

    initHamburgerMenu() {
        const hamburger = document.getElementById('navHamburger');
        const navLinks  = document.getElementById('navLinks');
        
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });

        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#') return;
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                // scroll-padding-top（CSSで130px設定）を活かすためwindow.scrollToを使用
                const scrollPadding = parseInt(
                    getComputedStyle(document.documentElement).scrollPaddingTop
                ) || 130;
                const top = target.getBoundingClientRect().top + window.scrollY - scrollPadding;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    /* ============================================
       編集モード
       ============================================ */
    toggleEditMode() {
        this.isEditing = !this.isEditing;
        document.body.classList.toggle('editing', this.isEditing);

        if (this.isEditing) {
            this.editBtn.textContent = '✅ 編集終了';
            this.editBtn.style.background = '#666';
            this.enableTextEditing();
            this.enableMediaEditing();
            this.enableTagEditing();
            this.showToast('✏️ 編集モード ON：すべての機能が利用可能です');
        } else {
            this.editBtn.textContent = '✏️ 編集モード';
            this.editBtn.style.background = '';
            this.disableTextEditing();
            this.disableMediaEditing();
            this.disableTagEditing();
            this.saveData();
            this.showToast('💾 変更内容を保存しました！');
        }
    }

    enableTextEditing() {
        document.querySelectorAll('[data-editable="text"]').forEach(el => {
            el.contentEditable = 'true';
            el.addEventListener('blur', () => this.saveData());
        });
    }

    disableTextEditing() {
        document.querySelectorAll('[data-editable="text"]').forEach(el => {
            el.contentEditable = 'false';
        });
    }

    /* ============================================
       タグ追加・削除機能
       ============================================ */
    enableTagEditing() {
        document.querySelectorAll('[data-editable="tags"]').forEach(container => {
            // 既存タグに削除ボタンを追加
            container.querySelectorAll('.specialty-tag').forEach(tag => {
                this._addTagDeleteBtn(tag);
            });

            // 追加ボタンを挿入
            if (!container.querySelector('.tag-add-btn')) {
                const addBtn = document.createElement('button');
                addBtn.className = 'tag-add-btn';
                addBtn.innerHTML = '<i class="fas fa-plus"></i> タグを追加';
                addBtn.addEventListener('click', () => this._addNewTag(container));
                container.appendChild(addBtn);
            }
        });
    }

    disableTagEditing() {
        document.querySelectorAll('.tag-delete-btn').forEach(btn => btn.remove());
        document.querySelectorAll('.tag-add-btn').forEach(btn => btn.remove());
    }

    _addTagDeleteBtn(tag) {
        if (tag.querySelector('.tag-delete-btn')) return;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tag-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'このタグを削除';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tagText = tag.textContent.replace('×', '').trim();
            if (confirm(`「${tagText}」を削除しますか？`)) {
                tag.remove();
                this.saveData();
                this.showToast(`🗑️ タグ「${tagText}」を削除しました`);
            }
        });
        tag.appendChild(deleteBtn);
    }

    _addNewTag(container) {
        const tagText = prompt('追加するタグ名を入力してください：', '新しいタグ');
        if (!tagText || !tagText.trim()) return;

        const newTag = document.createElement('span');
        newTag.className = 'specialty-tag';
        newTag.setAttribute('data-editable', 'text');
        newTag.textContent = tagText.trim();
        newTag.contentEditable = 'true';

        const addBtn = container.querySelector('.tag-add-btn');
        container.insertBefore(newTag, addBtn);
        
        this._addTagDeleteBtn(newTag);
        newTag.addEventListener('blur', () => this.saveData());
        
        this.saveData();
        this.showToast(`✅ タグ「${tagText.trim()}」を追加しました`);
    }

    /* ============================================
       メディア編集機能（37.7MB動画対応）
       ============================================ */
    _createFileInput() {
        const input = document.createElement('input');
        input.type   = 'file';
        input.accept = 'image/*,video/*';
        input.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        input.id = 'ftMediaFileInput';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && this._activeMediaEl) {
                this._processFile(file, this._activeMediaEl);
            }
            input.value = '';
        });

        document.body.appendChild(input);
        return input;
    }

    enableMediaEditing() {
        document.querySelectorAll('[data-editable="media"]').forEach(el => {
            el.addEventListener('click', this._onMediaClick);
            this._addMediaOverlay(el);
        });
    }

    disableMediaEditing() {
        document.querySelectorAll('[data-editable="media"]').forEach(el => {
            el.removeEventListener('click', this._onMediaClick);
            this._removeMediaOverlay(el);
        });
    }

    _onMediaClick = (e) => {
        // ヒーローセクション内の他の要素へのクリックは除外
        if (e.target.closest('.hero-content') || e.target.closest('.scroll-indicator')) {
            return;
        }

        e.stopPropagation();
        this._activeMediaEl = e.currentTarget;
        this._fileInput.click();
    }

    _addMediaOverlay(el) {
        if (el.querySelector('.media-edit-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'media-edit-overlay';
        overlay.innerHTML = `
            <div class="media-edit-hint">
                <i class="fas fa-camera"></i>
                <span>クリックして差し替え</span>
                <small>画像・動画対応（37MB対応）</small>
            </div>
        `;

        const pos = getComputedStyle(el).position;
        if (pos === 'static') {
            el.style.position = 'relative';
            el.dataset.hadStaticPosition = 'true';
        }

        el.appendChild(overlay);
    }

    _removeMediaOverlay(el) {
        el.querySelectorAll('.media-edit-overlay').forEach(o => o.remove());
        if (el.dataset.hadStaticPosition) {
            el.style.position = '';
            delete el.dataset.hadStaticPosition;
        }
    }

    _processFile(file, container) {
        const MB = file.size / 1024 / 1024;

        /* 5MB超の場合：外部ファイル参照方式 */
        if (MB > 5) {
            const proceed = confirm(
                `ファイルサイズが ${MB.toFixed(1)}MB です。\n\n` +
                `ブラウザの制限（5MB）を超えるため、外部ファイル方式で対応します：\n` +
                `1. 動画ファイルをわかりやすい名前に変更\n` +
                `2. ダウンロード後、HTMLファイルと同じフォルダに配置\n\n` +
                `この方式で設定しますか？`
            );
            
            if (!proceed) return;

            const fileName = prompt(
                '動画ファイル名を入力してください（例：hero-video.mp4）:',
                file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
            );
            
            if (fileName && fileName.trim()) {
                const isVideo = file.type.startsWith('video/') || fileName.match(/\.(mp4|webm|mov)$/i);
                this._applyMedia(container, fileName.trim(), isVideo, fileName.trim());
                this._saveExternalFileInfo(container, fileName.trim(), isVideo, MB);
                this.showToast(`✅ 外部ファイル「${fileName.trim()}」として設定しました`);
            }
            return;
        }

        /* 5MB以下は従来通り */
        this.showToast('⏳ ファイルを読み込み中...');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const isVideo = file.type.startsWith('video/');
            this._applyMedia(container, dataUrl, isVideo, file.name);
            this._saveMediaToStorage(container, dataUrl, isVideo, file.name);
            this.showToast(`✅ ${isVideo ? '動画' : '画像'}を差し替えました：${file.name}`);
        };
        reader.onerror = () => this.showToast('❌ ファイル読み込み失敗', 'error');
        reader.readAsDataURL(file);
    }

    _applyMedia(container, dataUrl, isVideo, fileName) {
        const existingImg   = container.querySelector('img');
        const existingVideo = container.querySelector('video');

        if (isVideo) {
            const video = document.createElement('video');
            video.src         = dataUrl;
            video.autoplay    = true;
            video.muted       = true;
            video.loop        = true;
            video.playsInline = true;
            video.className   = existingImg?.className || existingVideo?.className || 'hero-media';
            video.setAttribute('data-media-filename', fileName);

            if (existingVideo) {
                existingVideo.replaceWith(video);
            } else if (existingImg) {
                existingImg.replaceWith(video);
            } else {
                container.prepend(video);
            }
        } else {
            if (existingImg) {
                existingImg.src = dataUrl;
                existingImg.setAttribute('data-media-filename', fileName);
            } else if (existingVideo) {
                const img = document.createElement('img');
                img.src       = dataUrl;
                img.className = existingVideo.className;
                img.alt       = fileName;
                img.setAttribute('data-media-filename', fileName);
                existingVideo.replaceWith(img);
            } else {
                const img = document.createElement('img');
                img.src       = dataUrl;
                img.className = 'hero-media';
                img.alt       = fileName;
                container.prepend(img);
            }
        }
    }

    /* ============================================
       スマホプレビューモード
       ============================================ */
    toggleMobilePreview() {
        this._mobileMode = !this._mobileMode;
        document.body.classList.toggle('mobile-preview-mode', this._mobileMode);

        if (this._mobileMode) {
            this.mobileBtn.textContent = '🖥️ PC表示に戻す';
            this.mobileBtn.style.background = '#8e44ad';
            this.showToast('📱 スマホプレビュー（375px）に切り替えました');
        } else {
            this.mobileBtn.textContent = '📱 スマホ確認';
            this.mobileBtn.style.background = '';
            this.showToast('🖥️ PC表示に戻しました');
        }
    }

    /* ============================================
       データ全リセット
       ============================================ */
    resetAllData() {
        if (!confirm('すべての編集データをリセットしてHTMLの初期状態に戻しますか？\n（この操作は元に戻せません）')) return;
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.mediaKey);
        localStorage.removeItem(this.versionKey);
        this.showToast('🔄 データをリセットしました。ページを再読み込みします…');
        setTimeout(() => location.reload(), 1500);
    }

    /* ============================================
       データ保存・復元システム
       ============================================ */
    _getMediaId(container) {
        const section = container.closest('[data-section]');
        const sectionName = section ? section.dataset.section : 'unknown';
        const index = Array.from(document.querySelectorAll('[data-editable="media"]')).indexOf(container);
        return `media_${sectionName}_${index}`;
    }

    _saveMediaToStorage(container, dataUrl, isVideo, fileName) {
        try {
            const mediaData = JSON.parse(localStorage.getItem(this.mediaKey) || '{}');
            const id = this._getMediaId(container);
            mediaData[id] = { dataUrl, isVideo, fileName };
            localStorage.setItem(this.mediaKey, JSON.stringify(mediaData));
        } catch (err) {
            console.warn('メディア保存エラー:', err);
            this.showToast('⚠️ 保存容量が不足しています。', 'warning');
        }
    }

    _saveExternalFileInfo(container, fileName, isVideo, fileSizeMB) {
        try {
            const mediaData = JSON.parse(localStorage.getItem(this.mediaKey) || '{}');
            const id = this._getMediaId(container);
            mediaData[id] = { 
                fileName, 
                isVideo, 
                fileSizeMB, 
                isExternal: true, 
                timestamp: Date.now() 
            };
            localStorage.setItem(this.mediaKey, JSON.stringify(mediaData));
        } catch (err) {
            console.warn('外部ファイル情報保存エラー:', err);
        }
    }

    loadMediaData() {
        try {
            const mediaData = JSON.parse(localStorage.getItem(this.mediaKey) || '{}');
            document.querySelectorAll('[data-editable="media"]').forEach(container => {
                const id = this._getMediaId(container);
                if (mediaData[id]) {
                    const { dataUrl, isVideo, fileName, isExternal } = mediaData[id];
                    this._applyMedia(container, isExternal ? fileName : dataUrl, isVideo, fileName);
                }
            });
        } catch (err) {
            console.warn('メディア復元エラー:', err);
        }
    }

    saveData() {
        const data = {};
        
        // テキストデータ保存
        document.querySelectorAll('[data-editable="text"]').forEach((el, i) => {
            data[`text_${i}`] = el.innerHTML;
        });

        // タグデータ保存
        document.querySelectorAll('[data-editable="tags"]').forEach((container, ci) => {
            const tags = [];
            container.querySelectorAll('.specialty-tag').forEach(tag => {
                const tagText = tag.textContent.replace('×', '').trim();
                if (tagText) tags.push(tagText);
            });
            data[`tags_${ci}`] = tags;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    loadData() {
        try {
            const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');

            // ---- バージョンチェック ----
            // HTMLが更新されて要素数が変わったら保存データをクリアしてズレを防ぐ
            const currentCount = document.querySelectorAll('[data-editable="text"]').length;
            const savedCount   = parseInt(localStorage.getItem(this.versionKey) || '0');

            if (savedCount > 0 && savedCount !== currentCount) {
                console.warn(
                    `⚠️ 保存データの要素数(${savedCount})と現在のHTML(${currentCount})が不一致。`
                    + ' 古いデータをクリアします。'
                );
                localStorage.removeItem(this.storageKey);
                localStorage.removeItem(this.mediaKey);
                localStorage.setItem(this.versionKey, String(currentCount));
                return; // 復元せずデフォルトHTMLで表示
            }
            // 初回または一致している場合は要素数を記録
            localStorage.setItem(this.versionKey, String(currentCount));
            // ----------------------------
            
            // テキストデータ復元
            document.querySelectorAll('[data-editable="text"]').forEach((el, i) => {
                if (data[`text_${i}`] !== undefined) {
                    el.innerHTML = data[`text_${i}`];
                }
            });

            // タグデータ復元
            document.querySelectorAll('[data-editable="tags"]').forEach((container, ci) => {
                if (!data[`tags_${ci}`]) return;
                
                container.querySelectorAll('.specialty-tag').forEach(tag => tag.remove());
                
                data[`tags_${ci}`].forEach(tagText => {
                    const tag = document.createElement('span');
                    tag.className = 'specialty-tag';
                    tag.setAttribute('data-editable', 'text');
                    tag.textContent = tagText;
                    container.appendChild(tag);
                });
            });
        } catch (err) {
            console.warn('データ復元エラー:', err);
        }
    }

    /* ============================================
       テンプレート管理・エクスポート
       ============================================ */
    saveTemplate() {
        const template = {
            version: '4.1-pikkas',
            timestamp: new Date().toISOString(),
            text: {},
            media: JSON.parse(localStorage.getItem(this.mediaKey) || '{}')
        };

        document.querySelectorAll('[data-editable="text"]').forEach((el, i) => {
            template.text[`text_${i}`] = el.innerHTML;
        });

        localStorage.setItem(this.templateKey, JSON.stringify(template));
        this.showToast('📁 テンプレートを保存しました（全機能対応）！');
    }

    loadTemplate() {
        const saved = localStorage.getItem(this.templateKey);
        if (!saved) {
            this.showToast('⚠️ 保存済みテンプレートがありません', 'warning');
            return;
        }
        
        if (!confirm('テンプレートを読み込みます。現在の内容は上書きされます。よろしいですか？')) {
            return;
        }
        
        try {
            const template = JSON.parse(saved);

            document.querySelectorAll('[data-editable="text"]').forEach((el, i) => {
                if (template.text?.[`text_${i}`] !== undefined) {
                    el.innerHTML = template.text[`text_${i}`];
                }
            });

            if (template.media) {
                localStorage.setItem(this.mediaKey, JSON.stringify(template.media));
                this.loadMediaData();
            }

            this.showToast(`📂 テンプレート読み込み完了！(${template.version})`);
        } catch (err) {
            this.showToast('❌ テンプレート読み込みエラー', 'error');
            console.error(err);
        }
    }

    openPreview() {
        if (this.isEditing) this.toggleEditMode();
        setTimeout(() => window.open(window.location.href, '_blank'), 150);
    }

    exportHTML() {
        const toolbar  = document.getElementById('builderToolbar');
        const fileInput = document.getElementById('ftMediaFileInput');
        
        const hideEls = [toolbar, fileInput].filter(Boolean);
        hideEls.forEach(el => { 
            el.dataset.exportHide = el.style.display; 
            el.style.display = 'none'; 
        });

        const originalPadding = document.body.style.paddingTop;
        document.body.style.paddingTop = '116px';

        document.querySelectorAll('.media-edit-overlay, .tag-add-btn, .tag-delete-btn').forEach(el => el.remove());

        const wasMobile = this._mobileMode;
        if (wasMobile) document.body.classList.remove('mobile-preview-mode');

        const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML;

        hideEls.forEach(el => { 
            el.style.display = el.dataset.exportHide || ''; 
        });
        document.body.style.paddingTop = originalPadding;
        if (wasMobile) document.body.classList.add('mobile-preview-mode');

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `fortwo_v4_${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('💾 完全版サイトをダウンロードしました！');
    }

    showToast(message, type = 'success') {
        document.querySelector('.ft-toast')?.remove();

        const colors = {
            success: 'linear-gradient(135deg, #27ae60, #2ecc71)',
            warning: 'linear-gradient(135deg, #f39c12, #f1c40f)',
            error:   'linear-gradient(135deg, #e74c3c, #c0392b)'
        };

        const toast = document.createElement('div');
        toast.className = 'ft-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: ${colors[type] || colors.success};
            color: #fff;
            padding: 14px 32px;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 600;
            z-index: 99999;
            opacity: 0;
            transition: all 0.4s ease;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            pointer-events: none;
        `;

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(() => toast.remove(), 400);
        }, type === 'error' ? 4500 : 3000);
    }
}

/* ============================================
   お問い合わせフォーム
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());

        const serviceNames = {
            'normal':         '通常保育',
            'english-care':   '英語保育',
            'english-lesson': '英語レッスン',
            'gymnastics':     '英語ジムナスティック',
            'sst':            'SST保育（療育）',
            'undecided':      'まだ決まっていない'
        };

        const subject = encodeURIComponent(
            `【For Two お問い合わせ】${data.name || '保護者様'}より`
        );

        const body = encodeURIComponent([
            '以下の内容でお問い合わせがありました。',
            '',
            `■ お名前：${data.name || '（未入力）'}`,
            `■ メールアドレス：${data.email || '（未入力）'}`,
            `■ お子様の年齢：${data.childAge || '（未入力）'}`,
            `■ ご希望日時：${data.preferredDate || '（未入力）'}`,
            `■ ご希望のサービス：${serviceNames[data.service] || '（未選択）'}`,
            '',
            '■ ご質問・ご要望：',
            data.message || '（未入力）',
            '',
            '---',
            'For Two ホームページより送信'
        ].join('\n'));

        const toAddress = 'info@fortwo-example.com';
        window.location.href = `mailto:${toAddress}?subject=${subject}&body=${body}`;

        if (window.builder) {
            window.builder.showToast('📧 メールソフトを起動しました！');
        }
    });
}

/* ============================================
   起動
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    window.builder = new ForTwoBuilder();
    initContactForm();
});
