from flask import Flask, render_template, request, redirect, url_for
from database import get_db, init_db

app = Flask(__name__)


# ---------- Müşteri Formu ----------
@app.route("/")
def index():
    return render_template("index.html")


# ---------- Talep Oluştur ----------
@app.route("/talep-olustur", methods=["POST"])
def talep_olustur():
    ad_soyad = request.form.get("ad_soyad", "").strip()
    telefon = request.form.get("telefon", "").strip()
    cihaz = request.form.get("cihaz", "").strip()
    sorun = request.form.get("sorun", "").strip()

    if not all([ad_soyad, telefon, cihaz, sorun]):
        return redirect(url_for("index"))

    with get_db() as conn:
        conn.execute(
            "INSERT INTO talepler (ad_soyad, telefon, cihaz, sorun) VALUES (?, ?, ?, ?)",
            (ad_soyad, telefon, cihaz, sorun),
        )

    return redirect(url_for("tesekkur"))


# ---------- Teşekkür Sayfası ----------
@app.route("/tesekkur")
def tesekkur():
    return render_template("tesekkur.html")


# ---------- Admin Paneli ----------
@app.route("/admin")
def admin():
    durum_filtre = request.args.get("durum", "")
    arama = request.args.get("ara", "").strip()

    query = "SELECT * FROM talepler WHERE 1=1"
    params = []

    if durum_filtre:
        query += " AND durum = ?"
        params.append(durum_filtre)

    if arama:
        query += " AND ad_soyad LIKE ?"
        params.append(f"%{arama}%")

    query += " ORDER BY id DESC"

    with get_db() as conn:
        talepler = conn.execute(query, params).fetchall()

    return render_template(
        "admin.html",
        talepler=talepler,
        durum_filtre=durum_filtre,
        arama=arama,
    )


# ---------- Durum Güncelle ----------
@app.route("/durum-guncelle", methods=["POST"])
def durum_guncelle():
    talep_id = request.form.get("id")
    yeni_durum = request.form.get("durum")

    if talep_id and yeni_durum:
        with get_db() as conn:
            conn.execute(
                "UPDATE talepler SET durum = ? WHERE id = ?",
                (yeni_durum, talep_id),
            )

    return redirect(url_for("admin"))


# ---------- Talep Sil ----------
@app.route("/talep-sil", methods=["POST"])
def talep_sil():
    talep_id = request.form.get("id")

    if talep_id:
        with get_db() as conn:
            conn.execute("DELETE FROM talepler WHERE id = ?", (talep_id,))

    return redirect(url_for("admin"))


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
