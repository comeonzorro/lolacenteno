# Déploiement — lolacenteno.fr

Notes de mise en place (août 2026) : dépôt GitHub, hébergement Vercel et configuration DNS.

---

## Dépôt GitHub

| | |
|---|---|
| **Repo** | [github.com/comeonzorro/lolacenteno](https://github.com/comeonzorro/lolacenteno) |
| **Branche** | `main` |
| **Dossier local** | `/Users/leo/lolacenteno` |
| **Source initiale** | `/Users/leo/lolacentenowebsite/public_html/NEW4JUIN2026/` |

Le site est un site statique (HTML, CSS, JS, images, PDFs). Les fichiers sont à la **racine** du repo pour un déploiement Vercel sans build.

Structure :

```
lolacenteno/
├── index.html
├── css/lola.css
├── js/lola.js
├── images/
├── pdf/
├── vercel.json
└── .gitignore
```

Chaque `git push` sur `main` déclenche un redéploiement automatique (GitHub connecté à Vercel).

---

## Vercel

| | |
|---|---|
| **Production** | https://lolacenteno.vercel.app |
| **Dashboard** | https://vercel.com/comeonzorros-projects/lolacenteno |
| **Projet** | `comeonzorros-projects/lolacenteno` |
| **Framework** | Site statique (aucun build) |

### `vercel.json`

- `cleanUrls: true`
- Cache long (`max-age=31536000`) sur `/pdf/*` et `/images/*`

### Domaines ajoutés au projet

- `lolacenteno.fr`
- `www.lolacenteno.fr`

---

## DNS — configuration finale

Les **nameservers** ont été basculés chez **Vercel** (chez Hostinger / registrar) :

```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

Avec cette config, **Vercel gère toute la zone DNS**. Les enregistrements dans hPanel Hostinger ne sont plus pris en compte.

Zone DNS Vercel (automatique) :

| Type | Nom | Valeur |
|------|-----|--------|
| ALIAS | `@` | `fa308dbf64c732cb.vercel-dns-017.com` |
| ALIAS | `*` | `cname.vercel-dns-017.com` |
| CAA | `@` | Let's Encrypt, Sectigo, Google PKI |

Les sous-domaines (`www`, etc.) sont couverts par le wildcard `*`.

### Certificats SSL

- `lolacenteno.fr` — émis automatiquement
- `www.lolacenteno.fr` — émis manuellement via CLI le 19/08/2026 (`vercel certs issue www.lolacenteno.fr`)

---

## Historique DNS (avant bascule NS Vercel)

### Étape 1 — DNS Hostinger (19/08/2026)

En attendant Vercel, les enregistrements Hostinger avaient été mis à jour pour pointer vers Vercel :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | `@` | `76.76.21.21` | 300 |
| A | `www` | `76.76.21.21` | 300 |
| A | `ftp` | `91.108.101.150` | 1800 |

*(Ancienne config Hostinger : ALIAS `@` → `lolacenteno.fr.cdn.hstgr.net` et CNAME `www` → `www.lolacenteno.fr.cdn.hstgr.net`)*

### Étape 2 — Nameservers Vercel

Basculer les NS chez le registrar vers Vercel a simplifié la config et évite les conflits avec le CDN Hostinger (`hcdn`).

---

## Problème rencontré : 403 sur www

### Symptôme

`https://lolacenteno.fr/` → OK (Vercel)  
`https://www.lolacenteno.fr/` → **403** (platform: hostinger, server: hcdn)

### Causes

1. **Cache DNS / propagation** — certains résolveurs gardaient l'ancien CNAME `www` → `www.lolacenteno.fr.cdn.hstgr.net` (CDN Hostinger).
2. **Certificat SSL manquant pour www** — Vercel n'avait émis qu'un certificat pour `lolacenteno.fr`, pas pour `www.lolacenteno.fr`.

### Résolution

1. Bascule des nameservers vers Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`).
2. Émission du certificat SSL pour `www` : `vercel certs issue www.lolacenteno.fr`.
3. Attente de la propagation DNS (15 min à 24 h pour un `.fr`).

### Vérifier la propagation

```bash
# Nameservers visibles publiquement
dig NS lolacenteno.fr @8.8.8.8 +short

# Doit afficher :
# ns1.vercel-dns.com.
# ns2.vercel-dns.com.

# Réponse www via DNS Vercel
dig www.lolacenteno.fr @ns1.vercel-dns.com +short

# Vider le cache DNS local (macOS)
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

---

## Hostinger — hébergement existant

Un site Hostinger reste configuré pour `lolacenteno.fr` :

- **Username** : `u766403906`
- **Root** : `/home/u766403906/domains/lolacenteno.fr/public_html`

Il n'est plus servi une fois les NS pointés vers Vercel. L'hébergement peut être conservé en backup ou désactivé depuis hPanel si besoin.

---

## Commandes utiles

```bash
# Déployer manuellement en production
cd /Users/leo/lolacenteno
vercel --prod

# Inspecter un domaine
vercel domains inspect lolacenteno.fr
vercel domains inspect www.lolacenteno.fr

# Lister les certificats
vercel certs ls

# Lister les enregistrements DNS Vercel
vercel dns ls lolacenteno.fr
```

---

## Checklist post-déploiement

- [x] Repo GitHub `lolacenteno` créé et poussé
- [x] Déploiement Vercel production
- [x] Domaines `lolacenteno.fr` et `www.lolacenteno.fr` ajoutés
- [x] Nameservers basculés vers Vercel
- [x] Certificats SSL apex + www
- [ ] Vérifier `https://www.lolacenteno.fr/` après propagation DNS complète
- [ ] (Optionnel) Désactiver l'hébergement Hostinger devenu inutile
