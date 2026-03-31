// ═══════════════════════════════════════════════════════
// ROADMAP ENGINE v4.0 — CARD LIST REDESIGN
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const svgWrapper = document.querySelector('.roadmap-wrapper');
    if (!svgWrapper) return;

    // ── 1. Extract data from existing SVG nodes ───────────
    const nodeGroups = svgWrapper.querySelectorAll('.node-group');
    const milestones = [];

    nodeGroups.forEach((g, i) => {
        const idText    = g.querySelector('.milestone-id-text')?.textContent?.trim()   || String(i + 1).padStart(2, '0');
        const title     = g.querySelector('.milestone-label-title')?.textContent?.trim() || '';
        const topicEl   = g.querySelector('.tooltip-text:not(.tooltip-meta)');
        const levelEl   = g.querySelector('.tooltip-meta');
        const topics    = topicEl?.textContent?.trim() || '';
        const level     = levelEl?.textContent?.replace('LEVEL:', '').trim() || '';

        milestones.push({ id: idText, title, topics, level });
    });

    // ── 2. Build new HTML structure ───────────────────────
    const list = document.createElement('div');
    list.className = 'milestone-list';

    milestones.forEach((m, i) => {
        const isOdd = i % 2 === 0; // 0-indexed, so first is "odd" visually

        const item = document.createElement('div');
        item.className = 'milestone-item';

        // Card side
        const card = document.createElement('div');
        card.className = 'ms-card';
        card.innerHTML = `
            <div class="ms-level">${m.level}</div>
            <div class="ms-number">${m.id}</div>
            <div class="ms-title">${m.title}</div>
            <div class="ms-topics">${m.topics}</div>
        `;

        // Centre node
        const nodeWrap = document.createElement('div');
        nodeWrap.className = 'ms-node-wrap';
        const node = document.createElement('div');
        node.className = 'ms-node';
        node.innerHTML = `<span class="ms-node-num">${m.id}</span>`;
        nodeWrap.appendChild(node);

        // Spacer (other side)
        const spacer = document.createElement('div');
        spacer.className = 'ms-spacer';

        if (isOdd) {
            item.appendChild(card);
            item.appendChild(nodeWrap);
            item.appendChild(spacer);
        } else {
            item.appendChild(spacer);
            item.appendChild(nodeWrap);
            item.appendChild(card);
        }

        list.appendChild(item);

        // Click ripple on node
        node.addEventListener('click', () => {
            node.style.transform = 'scale(1.3)';
            setTimeout(() => { node.style.transform = ''; }, 200);
        });
    });

    // ── 3. Swap SVG out, insert list ─────────────────────
    // Keep wrapper, remove SVG, insert list
    const oldSvg = svgWrapper.querySelector('.roadmap-svg-canvas');
    if (oldSvg) oldSvg.remove();
    svgWrapper.appendChild(list);

    // ── 4. Staggered scroll-triggered reveal ─────────────
    const items = list.querySelectorAll('.milestone-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const idx = parseInt(el.dataset.idx || '0');
                setTimeout(() => {
                    el.classList.add('revealed');
                }, idx * 100);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.15 });

    items.forEach((item, i) => {
        item.dataset.idx = i;
        observer.observe(item);
    });

    // ── 5. Node pulse animation stagger ──────────────────
    const nodes = list.querySelectorAll('.ms-node');
    nodes.forEach((n, i) => {
        n.style.animation = `nodePulse ${2.5 + (i % 3) * 0.4}s ease-in-out ${i * 0.2}s infinite`;
    });
});
