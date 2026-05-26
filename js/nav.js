/**
 * nav.js — Mobile hamburger toggle + sticky nav behavior
 */

(function () {
  'use strict';

  const hamburger = document.getElementById('nav-hamburger');
  const navMenu   = document.getElementById('nav-menu');
  const nav       = document.getElementById('main-nav');

  if (!hamburger || !navMenu) return;

  // Toggle mobile menu
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('nav__menu--open');
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Animate hamburger lines
    const [top, mid, bot] = hamburger.querySelectorAll('span');
    if (isOpen) {
      top.style.transform = 'translateY(7px) rotate(45deg)';
      mid.style.opacity   = '0';
      bot.style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      top.style.transform = '';
      mid.style.opacity   = '';
      bot.style.transform = '';
    }
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navMenu.classList.contains('nav__menu--open')) {
      navMenu.classList.remove('nav__menu--open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('nav__menu--open')) {
      navMenu.classList.remove('nav__menu--open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });

  // Mark active nav link based on current path
  const currentPath = window.location.pathname;
  navMenu.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.startsWith(href) && href !== '/') {
      link.classList.add('nav__link--active');
    }
  });

})();
