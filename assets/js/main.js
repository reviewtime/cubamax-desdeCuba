(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');

    if (toggle && navLinks) {
        toggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var hashLinks = document.querySelectorAll('a[href^="#"]');
    hashLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            var targetId = this.getAttribute('href').substring(1);
            var target = document.getElementById(targetId);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    var cards = document.querySelectorAll('[data-moto-card]');
    var modal = document.querySelector('[data-modal]');

    if (!modal || cards.length === 0) {
        return;
    }

    var titleEl = modal.querySelector('[data-modal-title]');
    var descriptionEl = modal.querySelector('[data-modal-description]');
    var metaEl = modal.querySelector('[data-modal-meta]');
    var closeBtn = modal.querySelector('[data-modal-close]');
    var track = modal.querySelector('[data-slider-track]');
    var dots = modal.querySelector('[data-slider-dots]');
    var prevBtn = modal.querySelector('[data-slider-prev]');
    var nextBtn = modal.querySelector('[data-slider-next]');

    var sliderState = {
        index: 0,
        total: 0
    };

    var lastFocusedElement = null;

    function updateSlide(index) {
        if (!sliderState.total) {
            return;
        }
        sliderState.index = (index + sliderState.total) % sliderState.total;
        var offset = sliderState.index * -100;
        track.style.transform = 'translateX(' + offset + '%)';
        Array.prototype.forEach.call(dots.children, function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === sliderState.index);
        });
    }

    function buildMeta(card) {
        while (metaEl.firstChild) {
            metaEl.removeChild(metaEl.firstChild);
        }

        var metaItems = [];
        if (card.dataset.price) {
            metaItems.push(card.dataset.price);
        }

        var featureTexts = card.querySelectorAll('.card-features span');
        featureTexts.forEach(function (item) {
            var text = item.textContent.trim();
            if (text) {
                metaItems.push(text);
            }
        });

        var tagTexts = card.querySelectorAll('.tag');
        tagTexts.forEach(function (tag) {
            var text = tag.textContent.trim();
            if (text) {
                metaItems.push('#' + text.replace(/\s+/g, ''));
            }
        });

        metaItems.forEach(function (text) {
            var span = document.createElement('span');
            span.textContent = text;
            metaEl.appendChild(span);
        });
    }

    function buildSlider(card) {
        while (track.firstChild) {
            track.removeChild(track.firstChild);
        }
        while (dots.firstChild) {
            dots.removeChild(dots.firstChild);
        }

        var imageList = [];
        if (card.dataset.images) {
            imageList = card.dataset.images.split('|').map(function (item) {
                return item.trim();
            }).filter(Boolean);
        }

        sliderState.total = imageList.length;
        sliderState.index = 0;

        imageList.forEach(function (src, index) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = card.dataset.title + ' imagen ' + (index + 1);
            track.appendChild(img);

            var dot = document.createElement('button');
            dot.type = 'button';
            dot.addEventListener('click', function () {
                updateSlide(index);
            });
            if (index === 0) {
                dot.classList.add('is-active');
            }
            dots.appendChild(dot);
        });

        if (sliderState.total <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dots.style.display = 'none';
        } else {
            prevBtn.style.display = 'grid';
            nextBtn.style.display = 'grid';
            dots.style.display = 'flex';
        }

        updateSlide(0);
    }

    function ensureDescriptionList(element) {
        if (!element) {
            return element;
        }

        if (element.tagName === 'UL') {
            return element;
        }

        var list = document.createElement('ul');

        Array.prototype.forEach.call(element.attributes, function (attr) {
            list.setAttribute(attr.name, attr.value);
        });

        if (!list.hasAttribute('data-modal-description')) {
            list.setAttribute('data-modal-description', '');
        }

        var parent = element.parentNode;
        if (parent) {
            parent.replaceChild(list, element);
        }

        return list;
    }

    function buildDescription(card) {
        if (!descriptionEl) {
            return;
        }

        descriptionEl = ensureDescriptionList(descriptionEl);

        while (descriptionEl.firstChild) {
            descriptionEl.removeChild(descriptionEl.firstChild);
        }

        var rawDescription = card.dataset.description || '';
        var items = rawDescription.split('|').map(function (item) {
            return item.trim();
        }).filter(Boolean);
        var trimmedDescription = rawDescription.trim();

        if (!items.length && trimmedDescription) {
            items = [trimmedDescription];
        }

        items.forEach(function (item) {
            var li = document.createElement('li');
            li.textContent = item;
            descriptionEl.appendChild(li);
        });
    }

    function trapFocus(event) {
        if (!modal.classList.contains('is-open')) {
            return;
        }
        if (event.key !== 'Tab') {
            return;
        }

        var focusable = modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) {
            return;
        }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function openModal(card) {
        if (!modal) {
            return;
        }

        lastFocusedElement = document.activeElement;

        titleEl.textContent = card.dataset.title || '';
        buildDescription(card);

        buildMeta(card);
        buildSlider(card);

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            openModal(card);
        });

        card.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openModal(card);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    prevBtn.addEventListener('click', function () {
        updateSlide(sliderState.index - 1);
    });

    nextBtn.addEventListener('click', function () {
        updateSlide(sliderState.index + 1);
    });

    document.addEventListener('keydown', function (event) {
        if (!modal.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            event.preventDefault();
            closeModal();
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            updateSlide(sliderState.index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            updateSlide(sliderState.index + 1);
        }
    });

    document.addEventListener('keydown', trapFocus);
})();


