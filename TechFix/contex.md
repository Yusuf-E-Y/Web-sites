# TechFix Servis — Proje Context Dokümanı

## Proje Özeti

Küçük bir teknik servis firması (bilgisayar & telefon tamiri) için basit bir iş takip sistemi.
Mevcut süreç WhatsApp + defter üzerinden yürüyor; müşteri kaydı, cihaz durumu ve teslim tarihleri
kaçırılıyor. Bu sistem bu sorunu çözer.

---

## Teknik Stack

| Katman | Teknoloji | Neden |
|---|---|---|
| Backend | Python 3.10+ / Flask | Hafif, tek dosyada çalışır, öğrenmesi kolay |
| Veritabanı | SQLite (tek `.db` dosyası) | Kurulum gerektirmez, yeterince güçlü |
| Frontend | HTML5 + CSS3 + Vanilla JS | Framework yok, karmaşıklık yok |
| Şablonlama | Jinja2 (Flask ile birlikte gelir) | Python değişkenlerini HTML'e taşır |
| Paket yönetimi | pip + `requirements.txt` | Standart Python akışı |

---

## Klasör Yapısı

```
techfix/
├── app.py                  ← Tüm Flask rotaları burada
├── database.py             ← SQLite bağlantısı ve tablo oluşturma
├── techfix.db              ← Veritabanı dosyası (otomatik oluşur)
├── requirements.txt        ← flask
└── templates/
    ├── index.html          ← Müşteri formu (public)
    ├── tesekkur.html       ← Form sonrası teşekkür sayfası
    └── admin.html          ← Yönetim paneli (tüm talepler)
```

> `static/` klasörü UI aşamasında eklenecek (CSS, resimler).

---

## Veritabanı Şeması

Tek tablo yeterli:

```sql
CREATE TABLE IF NOT EXISTS talepler (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_soyad  TEXT    NOT NULL,
    telefon   TEXT    NOT NULL,
    cihaz     TEXT    NOT NULL,   -- 'Telefon' veya 'Bilgisayar'
    sorun     TEXT    NOT NULL,
    durum     TEXT    NOT NULL DEFAULT 'Bekliyor',  -- 'Bekliyor' | 'Tamirde' | 'Hazır'
    tarih     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Sayfalar ve Rotalar

### 1. Müşteri Formu — `GET /`

**Dosya:** `templates/index.html`

Kullanıcıdan alınacak alanlar:
- Ad soyad (text)
- Telefon numarası (text)
- Cihaz türü (select: Telefon / Bilgisayar)
- Sorun açıklaması (textarea)

Form submit: `POST /talep-olustur`

---

### 2. Talep Oluştur — `POST /talep-olustur`

**Dosya:** `app.py`

- Form verisini al
- SQLite'a INSERT et
- `tesekkur.html` sayfasına yönlendir

---

### 3. Teşekkür Sayfası — `GET /tesekkur`

**Dosya:** `templates/tesekkur.html`

- "Talebiniz alındı" mesajı
- Ana sayfaya dön linki

---

### 4. Admin Paneli — `GET /admin`

**Dosya:** `templates/admin.html`

Gösterilecekler:
- Tüm talepler tablo halinde (en yeni üstte)
- Her satırda: id, ad soyad, telefon, cihaz, sorun, durum, tarih

Filtreler (URL parametresi ile):
- `?durum=Bekliyor` → sadece bekleyenler
- `?durum=Tamirde` → tamirdekiler
- `?durum=Hazır` → hazır olanlar
- `?ara=ahmet` → isimle arama

---

### 5. Durum Güncelle — `POST /durum-guncelle`

**Dosya:** `app.py`

- Form'dan `id` ve yeni `durum` al
- SQLite'ta UPDATE et
- `/admin` sayfasına yönlendir

---

## Flask Uygulama Akışı (app.py)

```python
from flask import Flask, render_template, request, redirect, url_for
import sqlite3
from datetime import datetime

app = Flask(__name__)
DB = "techfix.db"

def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row   # sütun adıyla erişim: row['ad_soyad']
    return conn

# Uygulama başlarken tabloyu oluştur
def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS talepler (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                ad_soyad  TEXT NOT NULL,
                telefon   TEXT NOT NULL,
                cihaz     TEXT NOT NULL,
                sorun     TEXT NOT NULL,
                durum     TEXT NOT NULL DEFAULT 'Bekliyor',
                tarih     DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/talep-olustur", methods=["POST"])
def talep_olustur():
    # form verisi al ve kaydet
    ...

@app.route("/admin")
def admin():
    # filtre ve arama parametrelerini oku, veritabanından çek
    ...

@app.route("/durum-guncelle", methods=["POST"])
def durum_guncelle():
    # id ve yeni durumu al, güncelle
    ...

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
```

---

## Özellik Listesi

### Şu an yapılacaklar (MVP)
- [x] Müşteri talep formu
- [x] Talepleri veritabanına kaydetme
- [x] Admin panelinde tüm talepleri listeleme
- [x] Durumu güncelleme (Bekliyor / Tamirde / Hazır)
- [x] İsimle arama
- [x] Duruma göre filtreleme

### Sonraya bırakılanlar (UI aşaması)
- [ ] CSS ile güzel arayüz
- [ ] Renk kodlu durum badge'leri
- [ ] Mobil uyumlu (responsive) tasarım
- [ ] Admin için basit şifre koruması

### Kesinlikle YOK
- Ödeme sistemi
- Müşteri login sistemi
- Karmaşık UI framework (React, Vue vb.)
- Harici veritabanı sunucusu (PostgreSQL, MySQL vb.)

---

## Kurulum ve Çalıştırma

```bash
# 1. Klasörü oluştur
mkdir techfix && cd techfix

# 2. Sanal ortam (opsiyonel ama önerilir)
python -m venv venv
source venv/bin/activate    # Mac/Linux
venv\Scripts\activate       # Windows

# 3. Flask'ı yükle
pip install flask
pip freeze > requirements.txt

# 4. Uygulamayı başlat
python app.py

# 5. Tarayıcıda aç
# http://localhost:5000        → müşteri formu
# http://localhost:5000/admin  → yönetim paneli
```

---

## Test Kontrol Listesi

Her aşama bittikten sonra şunları kontrol et:

**Aşama 1 — Temel kurulum**
- [ ] `python app.py` hata vermeden çalışıyor
- [ ] `localhost:5000` tarayıcıda açılıyor

**Aşama 2 — Müşteri formu**
- [ ] Form alanları görünüyor
- [ ] Formu doldur → gönder → teşekkür sayfası çıkıyor
- [ ] DB Browser'da `talepler` tablosunda yeni satır var

**Aşama 3 — Admin paneli**
- [ ] `localhost:5000/admin` açılıyor
- [ ] Eklenen talepler tabloda görünüyor
- [ ] Dropdown'dan durum değiştir → kayıt güncelleniyor

**Aşama 4 — Arama & filtre**
- [ ] Arama kutusuna isim yaz → sadece o kişi geliyor
- [ ] `?durum=Tamirde` → sadece tamirdekiler görünüyor

---

## Notlar

- `debug=True` sadece geliştirme aşamasında. Canlıya alırken kapat.
- SQLite dosyası (`techfix.db`) silinirse tüm veriler gider — düzenli yedek al.
- Admin paneline URL'yi bilen herkes erişebilir. Şifre koruması UI aşamasından sonra eklenebilir.