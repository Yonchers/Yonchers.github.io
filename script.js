const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

const shell = document.querySelector('.lightbox-shell');
const shellImg = shell ? shell.querySelector('img') : null;
const closeBtn = shell ? shell.querySelector('.lightbox-close') : null;

document.querySelectorAll('.lightbox').forEach((btn) => {
  btn.addEventListener('click', () => {
    const src = btn.getAttribute('data-full') || btn.querySelector('img')?.src;
    const alt = btn.querySelector('img')?.alt || 'Expanded project image';
    if (!src || !shell || !shellImg) return;
    shellImg.src = src;
    shellImg.alt = alt;
    shell.hidden = false;
    closeBtn?.focus();
  });
});

function closeLightbox(){
  if (!shell || !shellImg) return;
  shell.hidden = true;
  shellImg.removeAttribute('src');
}
closeBtn?.addEventListener('click', closeLightbox);
shell?.addEventListener('click', (e) => { if (e.target === shell) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
