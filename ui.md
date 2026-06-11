<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UniTask – Micro-Internship & Freelance cho Sinh viên</title>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@700;800&display=swap" rel="stylesheet">
<style>
/* ─── RESET & TOKENS ─────────────────────────────── */
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
:root{
  --p:#5B4FFF;--pl:#7C72FF;--pd:#3D31E0;
  --accent:#FF6B35;--teal:#00D4AA;--gold:#FFB340;--red:#FF4D6B;
  --bg:#080614;--s1:#110E24;--s2:#18153A;--s3:#211E4A;
  --t0:#FFFFFF;--t1:#E8E5FF;--t2:#A09AC0;--t3:#5C5878;
  --bd:rgba(91,79,255,.18);
  --r6:6px;--r10:10px;--r14:14px;--r20:20px;--r28:28px;--rpill:999px;
  --font-display:'Syne',sans-serif;
  --font-body:'Be Vietnam Pro',sans-serif;
  --shadow-glow:0 0 60px rgba(91,79,255,.25);
  --shadow-card:0 4px 30px rgba(0,0,0,.5);
}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--bg);color:var(--t1);overflow-x:hidden;line-height:1.6}
img{max-width:100%}a{text-decoration:none;color:inherit}
button{cursor:pointer;font-family:var(--font-body);border:none;outline:none}
ul{list-style:none}

/* ─── SCROLLBAR ───────────────────────────────────── */
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{background:var(--p);border-radius:3px}

/* ─── NOISE OVERLAY ───────────────────────────────── */
body::before{
  content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  opacity:.4;
}

/* ─── UTILITY ─────────────────────────────────────── */
.container{max-width:1240px;margin:0 auto;padding:0 40px}
.tag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:var(--rpill);font-size:11.5px;font-weight:600;letter-spacing:.5px}
.tag-p{background:rgba(91,79,255,.15);color:#A89FFF;border:1px solid rgba(91,79,255,.3)}
.tag-t{background:rgba(0,212,170,.12);color:#4FFFDF;border:1px solid rgba(0,212,170,.25)}
.tag-a{background:rgba(255,107,53,.12);color:#FF9B72;border:1px solid rgba(255,107,53,.25)}
.tag-g{background:rgba(255,179,64,.12);color:#FFD080;border:1px solid rgba(255,179,64,.25)}
.fade-up{opacity:0;transform:translateY(30px);transition:opacity .7s ease,transform .7s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ─── BUTTONS ─────────────────────────────────────── */
.btn{display:inline-flex;align-items:center;gap:8px;padding:13px 28px;border-radius:var(--r10);font-size:14px;font-weight:700;transition:all .25s ease;letter-spacing:.3px}
.btn-primary{background:var(--p);color:#fff;box-shadow:0 0 30px rgba(91,79,255,.4)}
.btn-primary:hover{background:var(--pl);transform:translateY(-2px);box-shadow:0 8px 40px rgba(91,79,255,.55)}
.btn-accent{background:var(--accent);color:#fff;box-shadow:0 0 30px rgba(255,107,53,.35)}
.btn-accent:hover{background:#FF8050;transform:translateY(-2px);box-shadow:0 8px 40px rgba(255,107,53,.5)}
.btn-ghost{background:transparent;color:var(--t1);border:1.5px solid var(--bd)}
.btn-ghost:hover{border-color:var(--pl);color:var(--pl);background:rgba(91,79,255,.07)}
.btn-sm{padding:9px 20px;font-size:13px}

/* ─── NAVBAR ──────────────────────────────────────── */
.navbar{position:fixed;top:0;left:0;right:0;z-index:1000;transition:all .3s ease}
.navbar.scrolled{background:rgba(8,6,20,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--bd)}
.nav-inner{display:flex;align-items:center;gap:40px;padding:18px 40px;max-width:1240px;margin:0 auto}
.nav-logo{font-family:var(--font-display);font-size:22px;font-weight:800;color:#fff;display:flex;align-items:center;gap:3px;margin-right:auto}
.nav-logo span{color:var(--pl)}
.nav-logo .dot{width:7px;height:7px;border-radius:50%;background:var(--accent);margin-left:2px;margin-bottom:8px}
.nav-links{display:flex;align-items:center;gap:32px}
.nav-links a{font-size:14px;font-weight:500;color:var(--t2);transition:color .2s}
.nav-links a:hover,.nav-links a.active{color:#fff}
.nav-actions{display:flex;align-items:center;gap:12px;margin-left:20px}
.nav-login{font-size:14px;font-weight:600;color:var(--t2);padding:9px 18px;border-radius:var(--r10);transition:all .2s}
.nav-login:hover{color:#fff;background:rgba(255,255,255,.05)}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}
.hamburger span{display:block;width:22px;height:2px;background:var(--t1);border-radius:2px;transition:all .3s}

/* ─── MOBILE NAV ──────────────────────────────────── */
.mobile-nav{position:fixed;top:0;right:-100%;width:280px;height:100vh;background:var(--s1);border-left:1px solid var(--bd);z-index:2000;transition:right .35s cubic-bezier(.4,0,.2,1);padding:80px 32px 40px;display:flex;flex-direction:column;gap:8px}
.mobile-nav.open{right:0}
.mobile-nav a{padding:14px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:15px;font-weight:600;color:var(--t1);display:block}
.mobile-nav a:last-of-type{border:none}
.mobile-close{position:absolute;top:20px;right:24px;background:none;border:none;color:var(--t2);font-size:24px;cursor:pointer}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:1999;opacity:0;pointer-events:none;transition:opacity .3s}
.overlay.show{opacity:1;pointer-events:all}

/* ─── HERO ────────────────────────────────────────── */
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding-top:80px}
.hero-bg{position:absolute;inset:0;z-index:0}
.hero-orb{position:absolute;border-radius:50%;filter:blur(100px);animation:drift 8s ease-in-out infinite alternate}
.orb1{width:700px;height:700px;background:radial-gradient(circle,rgba(91,79,255,.28) 0%,transparent 70%);top:-15%;left:-8%;animation-duration:10s}
.orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(0,212,170,.15) 0%,transparent 70%);bottom:-10%;right:-5%;animation-duration:13s;animation-delay:-5s}
.orb3{width:300px;height:300px;background:radial-gradient(circle,rgba(255,107,53,.12) 0%,transparent 70%);top:30%;right:25%;animation-duration:7s;animation-delay:-2s}
@keyframes drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,20px) scale(1.05)}}
.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(91,79,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(91,79,255,.04) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)}
.hero-content{position:relative;z-index:2;max-width:780px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(91,79,255,.12);border:1px solid rgba(91,79,255,.35);border-radius:var(--rpill);padding:7px 16px;font-size:12px;font-weight:700;color:#A89FFF;letter-spacing:.8px;text-transform:uppercase;margin-bottom:28px;animation:fadeDown .8s ease .1s both}
.hero-badge .pulse{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:pulseGlow 2s ease-in-out infinite}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,212,170,.5)}50%{box-shadow:0 0 0 6px rgba(0,212,170,0)}}
.hero h1{font-family:var(--font-display);font-size:clamp(42px,6vw,72px);font-weight:800;line-height:1.05;color:#fff;margin-bottom:24px;animation:fadeDown .8s ease .2s both}
.hero h1 .highlight{position:relative;color:var(--pl)}
.hero h1 .highlight::after{content:'';position:absolute;bottom:-4px;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--p),var(--teal));border-radius:2px}
.hero h1 .accent-word{color:var(--accent)}
.hero-sub{font-size:17px;color:var(--t2);max-width:560px;line-height:1.75;margin-bottom:40px;animation:fadeDown .8s ease .3s both}
.hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:56px;animation:fadeDown .8s ease .4s both}
.hero-stats{display:flex;gap:40px;flex-wrap:wrap;animation:fadeDown .8s ease .5s both}
.stat-item{text-align:left}
.stat-num{font-family:var(--font-display);font-size:32px;font-weight:800;color:#fff;line-height:1}
.stat-num span{color:var(--pl)}
.stat-label{font-size:12px;color:var(--t3);margin-top:3px;font-weight:500}
.hero-visual{position:absolute;right:-40px;top:50%;transform:translateY(-50%);z-index:2;width:480px;animation:fadeLeft .9s ease .3s both}
@keyframes fadeDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeLeft{from{opacity:0;transform:translateX(40px) translateY(-50%)}to{opacity:1;transform:translateX(0) translateY(-50%)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

/* Floating job cards in hero */
.floating-cards{position:relative;width:440px;height:460px}
.float-card{position:absolute;background:rgba(24,21,58,.9);border:1px solid var(--bd);border-radius:var(--r14);padding:16px 18px;backdrop-filter:blur(10px);box-shadow:var(--shadow-card);width:220px}
.float-card:nth-child(1){top:0;left:0;animation:floatA 6s ease-in-out infinite}
.float-card:nth-child(2){top:80px;right:0;animation:floatB 7s ease-in-out infinite;animation-delay:-2s}
.float-card:nth-child(3){bottom:60px;left:30px;animation:floatA 8s ease-in-out infinite;animation-delay:-4s}
@keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
.fc-company{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.fc-logo{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff}
.fc-name{font-size:11px;color:var(--t3)}
.fc-company strong{font-size:13px;color:#fff;display:block;line-height:1.2}
.fc-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:8px}
.fc-pay{font-size:13px;font-weight:700;color:var(--teal);margin-bottom:8px}
.fc-foot{display:flex;align-items:center;justify-content:space-between}
.fc-tag{font-size:10px;padding:3px 8px;background:rgba(91,79,255,.2);color:#A89FFF;border-radius:var(--rpill);font-weight:600}
.fc-time{font-size:10px;color:var(--t3)}

/* ─── SECTION BASE ────────────────────────────────── */
section{padding:96px 0;position:relative}
.section-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--pl);margin-bottom:14px}
.section-eyebrow::before{content:'';width:24px;height:2px;background:var(--pl);border-radius:1px}
.section-title{font-family:var(--font-display);font-size:clamp(28px,4vw,44px);font-weight:800;color:#fff;line-height:1.15;margin-bottom:16px}
.section-sub{font-size:16px;color:var(--t2);max-width:520px;line-height:1.75}
.section-header{text-align:center;margin-bottom:60px}
.section-header .section-eyebrow{justify-content:center}
.section-header .section-sub{margin:0 auto}

/* ─── CATEGORIES ──────────────────────────────────── */
.categories{background:var(--s1);border-top:1px solid var(--bd);border-bottom:1px solid var(--bd)}
.cat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.cat-card{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r14);padding:24px 20px;display:flex;flex-direction:column;align-items:flex-start;gap:12px;cursor:pointer;transition:all .3s ease;position:relative;overflow:hidden}
.cat-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(91,79,255,.08),transparent);opacity:0;transition:opacity .3s}
.cat-card:hover{border-color:rgba(91,79,255,.5);transform:translateY(-4px);box-shadow:0 12px 40px rgba(91,79,255,.2)}
.cat-card:hover::before{opacity:1}
.cat-icon{width:46px;height:46px;border-radius:var(--r10);display:flex;align-items:center;justify-content:center;font-size:22px}
.cat-name{font-size:14px;font-weight:700;color:#fff}
.cat-count{font-size:12px;color:var(--t3)}
.cat-arrow{margin-left:auto;color:var(--pl);opacity:0;transition:opacity .2s,transform .2s;font-size:16px}
.cat-card:hover .cat-arrow{opacity:1;transform:translateX(3px)}

/* ─── SEARCH BAR ──────────────────────────────────── */
.search-section{background:linear-gradient(to bottom,var(--s1),var(--bg));padding:60px 0}
.search-box{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r20);padding:10px 10px 10px 20px;display:flex;gap:10px;align-items:center;max-width:900px;margin:0 auto;box-shadow:0 0 60px rgba(91,79,255,.12)}
.search-box input{flex:1;background:none;border:none;outline:none;font-size:15px;color:#fff;font-family:var(--font-body)}
.search-box input::placeholder{color:var(--t3)}
.search-divider{width:1px;height:28px;background:var(--bd)}
.search-box select{background:none;border:none;outline:none;font-size:14px;color:var(--t2);font-family:var(--font-body);padding:0 12px;cursor:pointer;-webkit-appearance:none}
.search-box select option{background:var(--s2);color:#fff}
.search-tags{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:18px}
.search-tags span{font-size:12px;color:var(--t3);padding:5px 12px;border:1px solid rgba(255,255,255,.08);border-radius:var(--rpill);cursor:pointer;transition:all .2s}
.search-tags span:hover{border-color:var(--pl);color:var(--pl)}
.search-tags .label{color:var(--t3);border:none;padding:5px 0}

/* ─── JOB CARDS ───────────────────────────────────── */
.jobs-section{padding-top:0}
.jobs-tabs{display:flex;gap:4px;margin-bottom:40px;background:var(--s2);border:1px solid var(--bd);border-radius:var(--r10);padding:5px;width:fit-content}
.job-tab{padding:9px 22px;border-radius:var(--r6);font-size:13px;font-weight:600;color:var(--t2);cursor:pointer;transition:all .25s}
.job-tab.active{background:var(--p);color:#fff;box-shadow:0 4px 16px rgba(91,79,255,.4)}
.jobs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.job-card{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r14);padding:22px;transition:all .3s ease;cursor:pointer;position:relative;overflow:hidden}
.job-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--p),var(--pl));opacity:0;transition:opacity .3s}
.job-card:hover{border-color:rgba(91,79,255,.45);transform:translateY(-5px);box-shadow:0 16px 50px rgba(91,79,255,.18)}
.job-card:hover::after{opacity:1}
.job-card.featured{border-color:rgba(0,212,170,.3);background:linear-gradient(135deg,rgba(0,212,170,.04),var(--s1))}
.job-card.featured::after{background:linear-gradient(90deg,var(--teal),var(--p));opacity:1}
.jc-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
.jc-logo{width:44px;height:44px;border-radius:var(--r10);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;flex-shrink:0}
.jc-save{width:32px;height:32px;border-radius:var(--r6);background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s;cursor:pointer}
.jc-save:hover{background:rgba(255,107,53,.15);border-color:rgba(255,107,53,.4);color:var(--accent)}
.jc-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:5px;line-height:1.3}
.jc-company{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--t3);margin-bottom:14px}
.verified{color:var(--teal);font-size:13px}
.jc-tags{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.jc-pay{font-size:15px;font-weight:700;color:var(--teal);margin-bottom:16px}
.jc-footer{display:flex;align-items:center;justify-content:space-between}
.jc-deadline{font-size:11.5px;color:var(--t3);display:flex;align-items:center;gap:5px}
.jc-btn{padding:7px 16px;background:rgba(91,79,255,.15);color:var(--pl);border-radius:var(--r6);font-size:12.5px;font-weight:700;border:1px solid rgba(91,79,255,.3);transition:all .2s}
.jc-btn:hover{background:var(--p);color:#fff;border-color:var(--p)}
.jc-spots{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--t3);margin-bottom:12px}
.spots-bar{flex:1;height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.spots-fill{height:100%;background:linear-gradient(90deg,var(--teal),var(--p));border-radius:2px}

/* ─── HOW IT WORKS ────────────────────────────────── */
.how-section{background:linear-gradient(180deg,var(--bg) 0%,var(--s1) 50%,var(--bg) 100%)}
.how-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:56px}
.how-tab{padding:11px 28px;border-radius:var(--rpill);font-size:14px;font-weight:700;cursor:pointer;transition:all .3s;border:1.5px solid var(--bd);color:var(--t2)}
.how-tab.active{background:var(--p);color:#fff;border-color:var(--p);box-shadow:0 0 30px rgba(91,79,255,.4)}
.how-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative}
.how-steps::before{content:'';position:absolute;top:36px;left:12%;right:12%;height:1.5px;background:linear-gradient(90deg,var(--p) 0%,var(--teal) 50%,var(--p) 100%);opacity:.3;z-index:0}
.how-step{text-align:center;padding:20px;position:relative;z-index:1}
.step-num{width:72px;height:72px;border-radius:50%;background:var(--s2);border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--pl);transition:all .4s;position:relative}
.step-num::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px dashed rgba(91,79,255,.25);animation:spin 12s linear infinite}
.how-step:hover .step-num{background:var(--p);color:#fff;border-color:var(--p);box-shadow:0 0 30px rgba(91,79,255,.5)}
@keyframes spin{to{transform:rotate(360deg)}}
.step-icon{font-size:28px;margin-bottom:8px}
.step-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:8px}
.step-desc{font-size:13px;color:var(--t2);line-height:1.65}

/* ─── FEATURES ────────────────────────────────────── */
.features-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.feature-card{background:var(--s1);border:1px solid var(--bd);border-radius:var(--r20);padding:32px;transition:all .35s}
.feature-card:hover{border-color:rgba(91,79,255,.4);box-shadow:0 0 50px rgba(91,79,255,.1)}
.feature-card.large{grid-row:span 2;background:linear-gradient(145deg,rgba(91,79,255,.12),var(--s2));border-color:rgba(91,79,255,.3)}
.feat-icon{width:52px;height:52px;border-radius:var(--r14);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;position:relative}
.feat-icon::after{content:'';position:absolute;inset:-1px;border-radius:var(--r14);padding:1px;background:linear-gradient(135deg,var(--p),var(--teal));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
.feat-title{font-size:17px;font-weight:700;color:#fff;margin-bottom:10px}
.feat-desc{font-size:13.5px;color:var(--t2);line-height:1.7}
.feat-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}
.feat-list li{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--t2)}
.feat-list li::before{content:'✓';width:20px;height:20px;border-radius:50%;background:rgba(0,212,170,.15);color:var(--teal);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0}

/* ─── TESTIMONIALS ────────────────────────────────── */
.testimonials-bg{background:var(--s1);border-top:1px solid var(--bd);border-bottom:1px solid var(--bd)}
.testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.testi-card{background:var(--s2);border:1px solid var(--bd);border-radius:var(--r14);padding:28px;transition:all .3s}
.testi-card:hover{border-color:rgba(91,79,255,.35);transform:translateY(-4px)}
.testi-stars{color:#FFB340;font-size:14px;margin-bottom:14px;letter-spacing:2px}
.testi-text{font-size:14px;color:var(--t1);line-height:1.75;margin-bottom:18px;font-style:italic}
.testi-author{display:flex;align-items:center;gap:12px}
.testi-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0}
.testi-name{font-size:13.5px;font-weight:700;color:#fff}
.testi-role{font-size:11.5px;color:var(--t3)}

/* ─── TRUST STRIP ─────────────────────────────────── */
.trust-strip{padding:32px 0;background:var(--bg);border-bottom:1px solid var(--bd)}
.trust-inner{display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap}
.trust-item{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--t3);font-weight:600}
.trust-item .icon{font-size:20px}
.trust-item strong{color:var(--t1)}

/* ─── CTA BANNER ──────────────────────────────────── */
.cta-section{padding:96px 0}
.cta-box{background:linear-gradient(135deg,var(--pd) 0%,var(--p) 40%,rgba(0,212,170,.6) 100%);border-radius:var(--r28);padding:72px 60px;text-align:center;position:relative;overflow:hidden}
.cta-box::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 60%);animation:rotateSlow 20s linear infinite}
@keyframes rotateSlow{to{transform:rotate(360deg)}}
.cta-box h2{font-family:var(--font-display);font-size:clamp(28px,4vw,48px);font-weight:800;color:#fff;margin-bottom:16px;position:relative;z-index:1}
.cta-box p{font-size:16px;color:rgba(255,255,255,.8);margin-bottom:36px;position:relative;z-index:1;max-width:500px;margin-left:auto;margin-right:auto}
.cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;z-index:1}
.btn-white{background:#fff;color:var(--pd);font-weight:800;box-shadow:0 8px 30px rgba(0,0,0,.2)}
.btn-white:hover{background:var(--t1);transform:translateY(-2px)}
.btn-outline-white{background:transparent;border:2px solid rgba(255,255,255,.5);color:#fff}
.btn-outline-white:hover{background:rgba(255,255,255,.1);border-color:#fff}

/* ─── FOOTER ──────────────────────────────────────── */
footer{background:var(--s1);border-top:1px solid var(--bd);padding:60px 0 30px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
.footer-brand .logo{font-family:var(--font-display);font-size:22px;font-weight:800;color:#fff;margin-bottom:12px;display:flex;align-items:center;gap:3px}
.footer-brand .logo span{color:var(--pl)}
.footer-brand p{font-size:13.5px;color:var(--t3);line-height:1.7;max-width:260px;margin-bottom:20px}
.social-links{display:flex;gap:10px}
.social-link{width:36px;height:36px;border-radius:var(--r6);background:var(--s2);border:1px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:15px;transition:all .2s;color:var(--t2)}
.social-link:hover{background:var(--p);border-color:var(--p);color:#fff;transform:translateY(-2px)}
.footer-col h4{font-size:13px;font-weight:700;color:#fff;letter-spacing:.5px;margin-bottom:16px;text-transform:uppercase}
.footer-col a{display:block;font-size:13.5px;color:var(--t3);margin-bottom:10px;transition:color .2s}
.footer-col a:hover{color:var(--pl)}
.footer-bottom{border-top:1px solid var(--bd);padding-top:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-bottom p{font-size:12.5px;color:var(--t3)}
.footer-badges{display:flex;gap:8px}
.f-badge{padding:4px 12px;background:rgba(91,79,255,.1);border:1px solid rgba(91,79,255,.25);border-radius:var(--rpill);font-size:11px;color:#A89FFF;font-weight:600}

/* ─── SCROLL TO TOP ───────────────────────────────── */
#scrollTop{position:fixed;bottom:32px;right:32px;width:44px;height:44px;background:var(--p);border-radius:var(--r10);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;cursor:pointer;opacity:0;transform:translateY(20px);transition:all .3s;z-index:500;box-shadow:0 4px 20px rgba(91,79,255,.5)}
#scrollTop.show{opacity:1;transform:translateY(0)}
#scrollTop:hover{background:var(--pl);transform:translateY(-3px)}

/* ─── RESPONSIVE ──────────────────────────────────── */
@media(max-width:1100px){
  .hero-visual{display:none}
  .cat-grid{grid-template-columns:repeat(4,1fr)}
  .jobs-grid{grid-template-columns:repeat(2,1fr)}
  .features-grid{grid-template-columns:1fr}
  .feature-card.large{grid-row:span 1}
}
@media(max-width:800px){
  .container{padding:0 24px}
  .nav-links,.nav-actions{display:none}
  .hamburger{display:flex}
  .hero h1{font-size:36px}
  .hero-stats{gap:24px}
  .stat-num{font-size:26px}
  .cat-grid{grid-template-columns:repeat(2,1fr)}
  .jobs-grid{grid-template-columns:1fr}
  .testi-grid{grid-template-columns:1fr}
  .how-steps{grid-template-columns:1fr 1fr;gap:24px}
  .how-steps::before{display:none}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .cta-box{padding:48px 28px}
  section{padding:64px 0}
  .search-box{flex-direction:column;align-items:stretch;gap:8px;padding:16px}
  .search-divider{display:none}
  .search-box select{padding:0}
  .trust-inner{gap:24px}
}
@media(max-width:500px){
  .cat-grid{grid-template-columns:1fr 1fr}
  .how-steps{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .hero-cta{flex-direction:column}
  .btn{justify-content:center}
  .footer-bottom{flex-direction:column;text-align:center}
}
</style>
</head>
<body>

<!-- ═══ OVERLAY ═══ -->
<div class="overlay" id="overlay" onclick="closeMobileNav()"></div>

<!-- ═══ MOBILE NAV ═══ -->
<nav class="mobile-nav" id="mobileNav">
  <button class="mobile-close" onclick="closeMobileNav()">✕</button>
  <a href="#jobs">🔍 Tìm việc</a>
  <a href="#how">💡 Cách hoạt động</a>
  <a href="#features">⭐ Tính năng</a>
  <a href="#testimonials">💬 Đánh giá</a>
  <a href="#" style="margin-top:16px">Đăng nhập</a>
  <a href="#" style="background:var(--p);color:#fff;border-radius:10px;text-align:center;margin-top:8px">Đăng ký miễn phí</a>
</nav>

<!-- ═══ NAVBAR ═══ -->
<header class="navbar" id="navbar">
  <div class="nav-inner">
    <div class="nav-logo">Uni<span>Task</span><div class="dot"></div></div>
    <nav class="nav-links">
      <a href="#jobs" class="active">Tìm việc</a>
      <a href="#how">Cách hoạt động</a>
      <a href="#features">Tính năng</a>
      <a href="#testimonials">Đánh giá</a>
      <a href="#">Doanh nghiệp</a>
    </nav>
    <div class="nav-actions">
      <a href="#" class="nav-login">Đăng nhập</a>
      <a href="#" class="btn btn-primary btn-sm">Đăng ký miễn phí →</a>
    </div>
    <div class="hamburger" onclick="openMobileNav()">
      <span></span><span></span><span></span>
    </div>
  </div>
</header>

<!-- ═══ HERO ═══ -->
<section class="hero">
  <div class="hero-bg">
    <div class="hero-grid"></div>
    <div class="hero-orb orb1"></div>
    <div class="hero-orb orb2"></div>
    <div class="hero-orb orb3"></div>
  </div>
  <div class="container" style="position:relative;z-index:2;display:flex;align-items:center;width:100%">
    <div class="hero-content">
      <div class="hero-badge">
        <div class="pulse"></div>
        🎓 Nền tảng #1 cho Sinh viên Việt Nam
      </div>
      <h1>
        Thực tập <span class="highlight">thực chiến</span><br>
        Kiếm tiền <span class="accent-word">ngay hôm nay</span>
      </h1>
      <p class="hero-sub">UniTask kết nối sinh viên với Startup & SME thông qua các Micro-job chuyên môn. Tích lũy kinh nghiệm, xây CV thực tế — không cần kinh nghiệm trước đó.</p>
      <div class="hero-cta">
        <a href="#jobs" class="btn btn-accent">🚀 Tìm việc ngay</a>
        <a href="#how" class="btn btn-ghost">Xem cách hoạt động →</a>
      </div>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-num">12<span>K+</span></div>
          <div class="stat-label">Sinh viên đã đăng ký</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">850<span>+</span></div>
          <div class="stat-label">Doanh nghiệp hợp tác</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">4.9<span>★</span></div>
          <div class="stat-label">Điểm đánh giá</div>
        </div>
      </div>
    </div>
    <div class="hero-visual">
      <div class="floating-cards">
        <div class="float-card">
          <div class="fc-company">
            <div class="fc-logo" style="background:linear-gradient(135deg,#5B4FFF,#7C72FF)">T</div>
            <div><strong>TechNova VN</strong><div class="fc-name">Startup · HCM ✅</div></div>
          </div>
          <div class="fc-title">UI/UX Designer</div>
          <div class="fc-pay">1.500.000 – 2.500.000 ₫</div>
          <div class="fc-foot">
            <span class="fc-tag">🎨 Thiết kế</span>
            <span class="fc-time">⏱ 2 tuần</span>
          </div>
        </div>
        <div class="float-card">
          <div class="fc-company">
            <div class="fc-logo" style="background:linear-gradient(135deg,#00D4AA,#00A882)">M</div>
            <div><strong>MarketHub</strong><div class="fc-name">SME · Hà Nội ✅</div></div>
          </div>
          <div class="fc-title">Content Writer (SEO)</div>
          <div class="fc-pay">800.000 – 1.200.000 ₫</div>
          <div class="fc-foot">
            <span class="fc-tag">✍️ Content</span>
            <span class="fc-time">⏱ 1 tuần</span>
          </div>
        </div>
        <div class="float-card">
          <div class="fc-company">
            <div class="fc-logo" style="background:linear-gradient(135deg,#FF6B35,#FF4D6B)">D</div>
            <div><strong>DevStack</strong><div class="fc-name">Startup · Remote ✅</div></div>
          </div>
          <div class="fc-title">Fix Bug — React Web</div>
          <div class="fc-pay">2.000.000 – 3.500.000 ₫</div>
          <div class="fc-foot">
            <span class="fc-tag">💻 IT</span>
            <span class="fc-time">⏱ 3 ngày</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TRUST STRIP ═══ -->
<div class="trust-strip">
  <div class="trust-inner">
    <div class="trust-item"><span class="icon">🛡️</span><div><strong>Escrow</strong> bảo vệ 100%</div></div>
    <div class="trust-item"><span class="icon">✅</span><div>Xác thực <strong>sinh viên & DN</strong></div></div>
    <div class="trust-item"><span class="icon">🤖</span><div><strong>Smart Match</strong> theo ngành học</div></div>
    <div class="trust-item"><span class="icon">📋</span><div>Tự động tạo <strong>Hồ sơ số</strong></div></div>
    <div class="trust-item"><span class="icon">💸</span><div><strong>0%</strong> phí ứng tuyển</div></div>
  </div>
</div>

<!-- ═══ CATEGORIES ═══ -->
<section class="categories" id="categories">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Khám phá ngành nghề</div>
      <h2 class="section-title">Chọn đúng ngành — Nhận đúng job</h2>
      <p class="section-sub">Hệ thống Smart Matching gợi ý job phù hợp với chuyên ngành bạn đang học</p>
    </div>
    <div class="cat-grid">
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(91,79,255,.15)">💻</div>
        <div><div class="cat-name">IT / Lập trình</div><div class="cat-count">284 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(255,107,53,.12)">🎨</div>
        <div><div class="cat-name">Thiết kế</div><div class="cat-count">167 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(0,212,170,.1)">📢</div>
        <div><div class="cat-name">Marketing</div><div class="cat-count">215 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(255,179,64,.1)">✍️</div>
        <div><div class="cat-name">Content / Viết lách</div><div class="cat-count">143 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(91,79,255,.15)">📊</div>
        <div><div class="cat-name">Kinh doanh</div><div class="cat-count">98 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(0,212,170,.1)">🌐</div>
        <div><div class="cat-name">Ngôn ngữ / Dịch thuật</div><div class="cat-count">76 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(255,107,53,.12)">💰</div>
        <div><div class="cat-name">Kế toán / Tài chính</div><div class="cat-count">54 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
      <div class="cat-card fade-up">
        <div class="cat-icon" style="background:rgba(255,179,64,.1)">🎬</div>
        <div><div class="cat-name">Video / Media</div><div class="cat-count">89 job đang mở</div></div>
        <span class="cat-arrow">→</span>
      </div>
    </div>
  </div>
</section>

<!-- ═══ SEARCH ═══ -->
<div class="search-section">
  <div class="container">
    <div style="text-align:center;margin-bottom:24px" class="fade-up">
      <h3 style="font-family:var(--font-display);font-size:26px;font-weight:800;color:#fff;margin-bottom:6px">Tìm job phù hợp ngay</h3>
      <p style="font-size:14px;color:var(--t3)">Hơn 1.100 job đang chờ bạn</p>
    </div>
    <div class="search-box fade-up">
      <span style="font-size:18px">🔍</span>
      <input type="text" placeholder="Tên job, kỹ năng... (VD: React, Thiết kế logo, SEO Content)" id="searchInput">
      <div class="search-divider"></div>
      <select id="catSelect">
        <option value="">Tất cả ngành</option>
        <option>💻 IT / Lập trình</option>
        <option>🎨 Thiết kế</option>
        <option>📢 Marketing</option>
        <option>✍️ Content</option>
        <option>🌐 Ngôn ngữ</option>
      </select>
      <div class="search-divider"></div>
      <select>
        <option>Tất cả hình thức</option>
        <option>Micro-task</option>
        <option>Freelance</option>
        <option>Micro-Internship</option>
      </select>
      <button class="btn btn-primary" onclick="filterJobs()" style="white-space:nowrap">Tìm kiếm</button>
    </div>
    <div class="search-tags fade-up">
      <span class="label">Tìm nhiều:</span>
      <span onclick="quickSearch('React')">React Developer</span>
      <span onclick="quickSearch('Thiết kế logo')">Thiết kế logo</span>
      <span onclick="quickSearch('Viết bài SEO')">Viết bài SEO</span>
      <span onclick="quickSearch('Dịch thuật')">Dịch thuật EN-VI</span>
      <span onclick="quickSearch('Fix bug')">Fix bug</span>
      <span onclick="quickSearch('Khảo sát')">Khảo sát thị trường</span>
    </div>
  </div>
</div>

<!-- ═══ JOBS ═══ -->
<section class="jobs-section" id="jobs">
  <div class="container">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:16px">
      <div class="fade-up">
        <div class="section-eyebrow">Việc làm nổi bật</div>
        <h2 class="section-title" style="margin-bottom:0">Cơ hội đang chờ bạn</h2>
      </div>
      <div class="jobs-tabs fade-up">
        <div class="job-tab active" onclick="switchTab(this,'all')">Tất cả</div>
        <div class="job-tab" onclick="switchTab(this,'it')">💻 IT</div>
        <div class="job-tab" onclick="switchTab(this,'design')">🎨 Thiết kế</div>
        <div class="job-tab" onclick="switchTab(this,'content')">✍️ Content</div>
        <div class="job-tab" onclick="switchTab(this,'marketing')">📢 Marketing</div>
      </div>
    </div>
    <div class="jobs-grid" id="jobsGrid">

      <!-- JOB 1 -->
      <div class="job-card featured fade-up" data-cat="it">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#5B4FFF,#7C72FF)">TN</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Frontend Developer (React + Tailwind)</div>
        <div class="jc-company">TechNova VN <span class="verified">✅</span> · Hồ Chí Minh</div>
        <div class="jc-tags">
          <span class="tag tag-p">💻 IT</span>
          <span class="tag tag-t">Remote</span>
          <span class="tag tag-g">🔥 Hot</span>
        </div>
        <div class="jc-spots">
          <span>Còn 2/5 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:60%"></div></div>
        </div>
        <div class="jc-pay">💰 2.500.000 – 4.000.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 5 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

      <!-- JOB 2 -->
      <div class="job-card fade-up" data-cat="design">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#FF6B35,#FF4D6B)">CR</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Thiết kế Bộ nhận diện thương hiệu</div>
        <div class="jc-company">CreativeBox Studio <span class="verified">✅</span> · Hà Nội</div>
        <div class="jc-tags">
          <span class="tag tag-a">🎨 Thiết kế</span>
          <span class="tag tag-t">Remote</span>
        </div>
        <div class="jc-spots">
          <span>Còn 1/3 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:33%"></div></div>
        </div>
        <div class="jc-pay">💰 1.800.000 – 3.000.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 8 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

      <!-- JOB 3 -->
      <div class="job-card fade-up" data-cat="content">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#00D4AA,#00A882)">MH</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Viết 10 bài SEO Blog (chuẩn EEAT)</div>
        <div class="jc-company">MarketHub VN <span class="verified">✅</span> · Remote</div>
        <div class="jc-tags">
          <span class="tag tag-t">✍️ Content</span>
          <span class="tag tag-g">Mới đăng</span>
        </div>
        <div class="jc-spots">
          <span>Còn 3/4 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:25%"></div></div>
        </div>
        <div class="jc-pay">💰 1.200.000 – 2.000.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 12 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

      <!-- JOB 4 -->
      <div class="job-card fade-up" data-cat="marketing">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#FFB340,#FF8C00)">GR</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Chạy quảng cáo Facebook Ads — F&B</div>
        <div class="jc-company">GreenBowl Restaurant <span class="verified">✅</span> · Đà Nẵng</div>
        <div class="jc-tags">
          <span class="tag tag-g">📢 Marketing</span>
          <span class="tag tag-a">Onsite</span>
        </div>
        <div class="jc-spots">
          <span>Còn 2/2 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:50%"></div></div>
        </div>
        <div class="jc-pay">💰 2.000.000 – 3.500.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 3 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

      <!-- JOB 5 -->
      <div class="job-card fade-up" data-cat="it">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#7C72FF,#5B4FFF)">DS</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Fix Bug Python Flask API — E-commerce</div>
        <div class="jc-company">DevStack JSC <span class="verified">✅</span> · Remote</div>
        <div class="jc-tags">
          <span class="tag tag-p">💻 IT</span>
          <span class="tag tag-t">Remote</span>
          <span class="tag tag-g">🔥 Gấp</span>
        </div>
        <div class="jc-spots">
          <span>Còn 1/1 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:10%"></div></div>
        </div>
        <div class="jc-pay">💰 3.000.000 – 5.000.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 2 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

      <!-- JOB 6 -->
      <div class="job-card fade-up" data-cat="content">
        <div class="jc-header">
          <div class="jc-logo" style="background:linear-gradient(135deg,#FF4D6B,#FF6B35)">LM</div>
          <div class="jc-save">🔖</div>
        </div>
        <div class="jc-title">Dịch thuật Tài liệu Kỹ thuật EN→VI (5.000 từ)</div>
        <div class="jc-company">LinguaMedia Corp <span class="verified">✅</span> · Remote</div>
        <div class="jc-tags">
          <span class="tag tag-a">🌐 Ngôn ngữ</span>
          <span class="tag tag-t">Remote</span>
        </div>
        <div class="jc-spots">
          <span>Còn 4/5 chỗ</span>
          <div class="spots-bar"><div class="spots-fill" style="width:80%"></div></div>
        </div>
        <div class="jc-pay">💰 900.000 – 1.500.000 ₫</div>
        <div class="jc-footer">
          <div class="jc-deadline">⏰ Còn 15 ngày</div>
          <button class="jc-btn">Xem chi tiết →</button>
        </div>
      </div>

    </div>
    <div style="text-align:center;margin-top:44px" class="fade-up">
      <a href="#" class="btn btn-ghost">Xem tất cả 1.100+ job →</a>
    </div>
  </div>
</section>

<!-- ═══ HOW IT WORKS ═══ -->
<section class="how-section" id="how">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Quy trình</div>
      <h2 class="section-title">Đơn giản — Minh bạch — An toàn</h2>
      <p class="section-sub">Chỉ 4 bước để bắt đầu kiếm thu nhập từ chuyên ngành của bạn</p>
    </div>
    <div class="how-tabs">
      <div class="how-tab active" onclick="switchHowTab(this,'student')">👨‍🎓 Dành cho Sinh viên</div>
      <div class="how-tab" onclick="switchHowTab(this,'business')">🏢 Dành cho Doanh nghiệp</div>
    </div>
    <div id="howContent">
      <div class="how-steps" id="howSteps">
        <div class="how-step fade-up">
          <div class="step-num">01</div>
          <div class="step-icon">🎓</div>
          <div class="step-title">Đăng ký & Xác thực</div>
          <div class="step-desc">Tạo tài khoản với email .edu hoặc thẻ sinh viên. Hệ thống xác minh trong 24h.</div>
        </div>
        <div class="how-step fade-up">
          <div class="step-num">02</div>
          <div class="step-icon">🤖</div>
          <div class="step-title">Smart Matching</div>
          <div class="step-desc">Hệ thống gợi ý job phù hợp với ngành học và kỹ năng bạn đã có.</div>
        </div>
        <div class="how-step fade-up">
          <div class="step-num">03</div>
          <div class="step-icon">⚡</div>
          <div class="step-title">Làm việc & Nộp bài</div>
          <div class="step-desc">Nhận task, thực hiện, nộp sản phẩm qua hệ thống. Doanh nghiệp review trực tuyến.</div>
        </div>
        <div class="how-step fade-up">
          <div class="step-num">04</div>
          <div class="step-icon">🏆</div>
          <div class="step-title">Nhận tiền + Hồ sơ số</div>
          <div class="step-desc">Tiền Escrow tự động chuyển ví. Project tự động cập nhật vào CV điện tử của bạn.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FEATURES ═══ -->
<section id="features">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Tính năng cốt lõi</div>
      <h2 class="section-title">Được xây dựng vì sinh viên</h2>
      <p class="section-sub">Mọi tính năng đều giải quyết một vấn đề thực tế mà sinh viên đang gặp phải</p>
    </div>
    <div class="features-grid">
      <div class="feature-card large fade-up">
        <div class="feat-icon" style="background:rgba(91,79,255,.15)">🛡️</div>
        <h3 class="feat-title">Hệ thống Escrow — Không bao giờ bị bùng tiền</h3>
        <p class="feat-desc">Doanh nghiệp nạp tiền vào hệ thống trước khi job bắt đầu. Tiền chỉ được giải phóng khi bạn hoàn thành và được duyệt. UniTask làm trung gian bảo vệ quyền lợi cả hai phía.</p>
        <ul class="feat-list">
          <li>Tiền giữ an toàn trong tài khoản Escrow</li>
          <li>Tranh chấp có đội ngũ hỗ trợ giải quyết</li>
          <li>Lịch sử giao dịch minh bạch 100%</li>
          <li>Rút tiền về ví/bank trong 24h</li>
        </ul>
      </div>
      <div class="feature-card fade-up">
        <div class="feat-icon" style="background:rgba(0,212,170,.1)">🤖</div>
        <h3 class="feat-title">Smart Matching theo ngành học</h3>
        <p class="feat-desc">Sinh viên Ngôn ngữ Anh thấy job dịch thuật. Sinh viên IT thấy job code. Không lãng phí thời gian lọc thủ công.</p>
      </div>
      <div class="feature-card fade-up">
        <div class="feat-icon" style="background:rgba(255,107,53,.1)">📋</div>
        <h3 class="feat-title">Hồ sơ số tự động (Digital CV)</h3>
        <p class="feat-desc">Mỗi project hoàn thành tự động cập nhật vào CV điện tử. Xuất PDF đẹp, chia sẻ link cho nhà tuyển dụng.</p>
      </div>
      <div class="feature-card fade-up">
        <div class="feat-icon" style="background:rgba(255,179,64,.1)">⭐</div>
        <h3 class="feat-title">Đánh giá 2 chiều & Skill Endorsement</h3>
        <p class="feat-desc">Doanh nghiệp không chỉ chấm sao — họ xác nhận kỹ năng cụ thể của bạn. Hồ sơ ngày càng giá trị hơn.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TESTIMONIALS ═══ -->
<section class="testimonials-bg" id="testimonials">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-eyebrow">Câu chuyện thành công</div>
      <h2 class="section-title">Sinh viên nói gì về UniTask?</h2>
    </div>
    <div class="testi-grid">
      <div class="testi-card fade-up">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"Mình đã làm 8 project trên UniTask từ năm 3. Khi ra trường, CV của mình có 8 dự án thực tế rõ ràng. Nhà tuyển dụng rất ấn tượng, mình nhận offer ngay vòng 1!"</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#5B4FFF,#7C72FF)">N</div>
          <div>
            <div class="testi-name">Nguyễn Minh Khoa</div>
            <div class="testi-role">SV năm 4 — CNTT, HCMUT · Frontend Dev</div>
          </div>
        </div>
      </div>
      <div class="testi-card fade-up">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"Trước đây mình sợ làm freelance vì hay bị bùng tiền. UniTask có Escrow nên mình hoàn toàn yên tâm. 5 tháng mình kiếm được gần 18 triệu từ việc dịch thuật."</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#FF6B35,#FF4D6B)">T</div>
          <div>
            <div class="testi-name">Trần Phương Linh</div>
            <div class="testi-role">SV năm 3 — Ngôn ngữ Anh, ULIS · Dịch thuật</div>
          </div>
        </div>
      </div>
      <div class="testi-card fade-up">
        <div class="testi-stars">★★★★★</div>
        <p class="testi-text">"Tuyển dụng qua UniTask tiết kiệm 60% chi phí so với dùng headhunter. Sinh viên được xác thực và có kỹ năng rõ ràng, mình không phải lo ngại chất lượng."</p>
        <div class="testi-author">
          <div class="testi-avatar" style="background:linear-gradient(135deg,#00D4AA,#00A882)">H</div>
          <div>
            <div class="testi-name">Huỳnh Thanh Tùng</div>
            <div class="testi-role">Co-founder — BrandSpace Startup · Khách hàng DN</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ═══ CTA BANNER ═══ -->
<section class="cta-section">
  <div class="container">
    <div class="cta-box fade-up">
      <h2>Sẵn sàng bắt đầu chưa?</h2>
      <p>Tham gia cùng 12.000+ sinh viên đang kiếm tiền từ chuyên ngành của mình. Hoàn toàn miễn phí để đăng ký.</p>
      <div class="cta-btns">
        <a href="#" class="btn btn-white btn-accent">🎓 Tôi là Sinh viên — Đăng ký ngay</a>
        <a href="#" class="btn btn-outline-white">🏢 Tôi là Doanh nghiệp — Đăng job →</a>
      </div>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ═══ -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="logo">Uni<span>Task</span></div>
        <p>Nền tảng Micro-Internship & Freelance kết nối Sinh viên với Startup/SME. Xây CV thực chiến ngay từ ghế nhà trường.</p>
        <div class="social-links">
          <a href="#" class="social-link" title="Facebook">f</a>
          <a href="#" class="social-link" title="LinkedIn">in</a>
          <a href="#" class="social-link" title="TikTok">tt</a>
          <a href="#" class="social-link" title="YouTube">▶</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Sinh viên</h4>
        <a href="#">Tìm việc làm</a>
        <a href="#">Cách hoạt động</a>
        <a href="#">Hồ sơ số</a>
        <a href="#">Ví & Escrow</a>
        <a href="#">Hỗ trợ SV</a>
      </div>
      <div class="footer-col">
        <h4>Doanh nghiệp</h4>
        <a href="#">Đăng job</a>
        <a href="#">Tìm ứng viên</a>
        <a href="#">Gói dịch vụ</a>
        <a href="#">Xác thực DN</a>
        <a href="#">API cho DN</a>
      </div>
      <div class="footer-col">
        <h4>UniTask</h4>
        <a href="#">Về chúng tôi</a>
        <a href="#">Blog & Tài nguyên</a>
        <a href="#">Điều khoản</a>
        <a href="#">Chính sách BM</a>
        <a href="#">Liên hệ</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 UniTask. Made with ❤️ for Vietnamese students.</p>
      <div class="footer-badges">
        <span class="f-badge">🛡️ Escrow Protected</span>
        <span class="f-badge">✅ Student Verified</span>
        <span class="f-badge">🔒 SSL Secured</span>
      </div>
    </div>
  </div>
</footer>

<!-- ═══ SCROLL TO TOP ═══ -->
<button id="scrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>

<!-- ═══ SCRIPTS ═══ -->
<script>
// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  // Scroll to top button
  const btn = document.getElementById('scrollTop');
  if (window.scrollY > 400) btn.classList.add('show');
  else btn.classList.remove('show');
});

// Mobile nav
function openMobileNav() {
  document.getElementById('mobileNav').classList.add('open');
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
}

// Intersection Observer for fade-up
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Job tabs
function switchTab(el, cat) {
  document.querySelectorAll('.job-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.job-card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.style.display = '';
      card.style.opacity = '1';
    } else {
      card.style.display = 'none';
    }
  });
}

// How tabs
function switchHowTab(el, mode) {
  document.querySelectorAll('.how-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const stepsData = {
    student: [
      {num:'01',icon:'🎓',title:'Đăng ký & Xác thực',desc:'Tạo tài khoản với email .edu hoặc thẻ sinh viên. Hệ thống xác minh trong 24h.'},
      {num:'02',icon:'🤖',title:'Smart Matching',desc:'Hệ thống gợi ý job phù hợp với ngành học và kỹ năng bạn đã có sẵn.'},
      {num:'03',icon:'⚡',title:'Làm việc & Nộp bài',desc:'Nhận task, thực hiện, nộp sản phẩm qua hệ thống. Doanh nghiệp review trực tuyến.'},
      {num:'04',icon:'🏆',title:'Nhận tiền + Hồ sơ số',desc:'Tiền Escrow tự động chuyển ví. Project tự động cập nhật vào CV điện tử của bạn.'},
    ],
    business: [
      {num:'01',icon:'🏢',title:'Đăng ký Doanh nghiệp',desc:'Tạo tài khoản, xác thực thông tin DN. Quá trình nhanh chóng, hoàn thành trong ngày.'},
      {num:'02',icon:'💰',title:'Nạp tiền Escrow',desc:'Nạp ngân sách vào hệ thống. Tiền chỉ trả khi bạn duyệt sản phẩm hoàn chỉnh.'},
      {num:'03',icon:'📋',title:'Đăng Job & Chọn ứng viên',desc:'Mô tả task ngắn gọn. Hệ thống tự gợi ý sinh viên phù hợp, bạn chọn và phê duyệt.'},
      {num:'04',icon:'✅',title:'Duyệt & Thanh toán',desc:'Review sản phẩm, đánh giá kỹ năng sinh viên. Giải phóng tiền khi hài lòng.'},
    ]
  };
  const steps = stepsData[mode];
  document.getElementById('howSteps').innerHTML = steps.map(s => `
    <div class="how-step fade-up visible">
      <div class="step-num">${s.num}</div>
      <div class="step-icon">${s.icon}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>
    </div>
  `).join('');
}

// Search
function quickSearch(term) {
  document.getElementById('searchInput').value = term;
  document.getElementById('jobs').scrollIntoView({behavior:'smooth'});
}
function filterJobs() {
  document.getElementById('jobs').scrollIntoView({behavior:'smooth'});
}

// Animated counters
function animateCounter(el, target, suffix='') {
  let start = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = Math.floor(start).toLocaleString('vi-VN') + suffix;
  }, 25);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const nums = document.querySelectorAll('.stat-num');
      nums[0] && animateCounter(nums[0].childNodes[0], 12, 'K+');
      nums[1] && animateCounter(nums[1].childNodes[0], 850, '+');
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// Smooth nav active state
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + cur) a.classList.add('active');
  });
});
</script>
</body>
</html>