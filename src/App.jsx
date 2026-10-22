import { useState } from "react";
import "./style.css";

export default function App() {
const [onglet, setOnglet] = useState("Accueil");
const [classes, setClasses] = useState(() =>
JSON.parse(localStorage.getItem("profconnect_classes") || "[]")
);
const [nouvelleClasse, setNouvelleClasse] = useState("");

function ajouterClasse(e) {
e.preventDefault();
const nom = nouvelleClasse.trim();
if (!nom) return;
const miseAJour = [...classes, { id: Date.now(), nom }];
setClasses(miseAJour);
localStorage.setItem("profconnect_classes", JSON.stringify(miseAJour));
setNouvelleClasse("");
}

const menus = ["Accueil", "Classes", "Élèves", "Notes", "Devoirs", "Absences", "Emploi du temps"];

return (
<div className="app">
<aside className="sidebar">
<h2>ProfConnect</h2>
<p className="subtitle">Espace enseignant</p>
<nav>
{menus.map((menu) => (
<button
key={menu}
className={onglet === menu ? "menu active" : "menu"}
onClick={() => setOnglet(menu)}
>
{menu}
</button>
))}
</nav>
</aside>

  <main className="main">
    <header className="topbar">
      <div>
        <p className="eyebrow">ESPACE ENSEIGNANT</p>
        <h1>{onglet}</h1>
      </div>
      <span className="avatar">P</span>
    </header>

    {onglet === "Accueil" && (
      <section>
        <div className="welcome">
          <h2>Bienvenue sur ProfConnect</h2>
          <p>Retrouvez vos classes, vos élèves et votre suivi pédagogique au même endroit.</p>
        </div>
        <div className="cards">
          <article className="card">
            <span>Classes</span>
            <strong>{classes.length}</strong>
          </article>
          <article className="card">
            <span>Notes</span>
            <strong>—</strong>
          </article>
          <article className="card">
            <span>Devoirs</span>
            <strong>—</strong>
          </article>
        </div>
        <div className="panel">
          <h3>Pour commencer</h3>
          <p>Ouvrez « Classes » pour ajouter votre première classe.</p>
          <button className="primary" onClick={() => setOnglet("Classes")}>
            Gérer mes classes
          </button>
        </div>
      </section>
    )}

    {onglet === "Classes" && (
      <section className="panel">
        <h2>Mes classes</h2>
        <p>Ajoutez et retrouvez vos classes.</p>
        <form onSubmit={ajouterClasse} className="class-form">
          <input
            value={nouvelleClasse}
            onChange={(e) => setNouvelleClasse(e.target.value)}
            placeholder="Ex. : 5e B"
            aria-label="Nom de la classe"
          />
          <button className="primary" type="submit">Ajouter</button>
        </form>
        {classes.length === 0 ? (
          <p className="empty">Aucune classe pour le moment.</p>
        ) : (
          <div className="class-list">
            {classes.map((classe) => (
              <div className="class-item" key={classe.id}>
                <strong>{classe.nom}</strong>
                <span>Classe</span>
              </div>
            ))}
          </div>
        )}
      </section>
    )}

    {onglet !== "Accueil" && onglet !== "Classes" && (
      <section className="panel">
        <h2>{onglet}</h2>
        <p>Cette rubrique est prête à être développée.</p>
        <p>Les fonctions de cette rubrique ne sont pas encore connectées.</p>
      </section>
    )}

    <footer>ProfConnect · Espace enseignant</footer>
  </main>
</div>

);
}
