# Revolut Plus-Value Impôts FR

**Calculateur open-source de plus-values boursières (méthode PMP) pour la fiscalité française**

Par **Jules Pondard – Artix Technologies**

**Testable ici : ** [Lien vers le simulateur en ligne](https://artixjp.github.io/revolut-plus-value-impots-fr/src/)

---

## 📌 Présentation

Revolut ne permet aujourd'hui pas de calculer simplement les plus-values réalisées, et donc ce qu'on doit déclarer aux impôts. 

Ce projet fournit une interface web entièrement locale (client-side) permettant d’analyser automatiquement un fichier CSV *Revolut Stocks* et d’en déduire :

* les **plus-values boursières** selon la méthode fiscale française (PMP — Prix Moyen Pondéré),
* les **dividendes** réellement perçus (convertis en euros au FX historique),
* les **custody fees** (frais de garde),
* des tableaux agrégés **par mois** ou **par année**,
* une lecture claire et pédagogique du résultat.

Aucun envoi de données :
**Tout est exécuté dans le navigateur**, localement, pour préserver la confidentialité financière de l’utilisateur.

---

## 🎯 Pourquoi ce projet ?

Les exports CSV fournis par Revolut sont **inutilisables tels quels** pour calculer la fiscalité française :

* Revolut calcule des plus-values en FIFO, *non conformes en France*.
* Le fisc impose la méthode du **PMP (Prix Moyen Pondéré)**.
* Le CSV mélange USD / EUR avec des FX variables.
* Les stock splits, dividendes et regroupements doivent être retraités.
* La CAF / RSA lit la fiscalité basée sur le PMP, pas sur les gains réels.

Ce projet vise à :

1. **Fournir un calcul conforme au BOFiP**,
2. **Compréhensible pour les particuliers**,
3. **Open-source**,
4. **Auditible**,
5. **Sans serveur**,
6. Et utilisable sans compétences techniques.

---

## ✨ Fonctionnalités

* Upload d’un fichier CSV Revolut (Stocks).
* Parsing automatique avec PapaParse.
* Calcul de la plus-value en **méthode PMP**, incluant :

  * conversion en EUR via le `FX Rate`,
  * ajustement des stock splits (forward / reverse),
  * gestion des fractions d’actions.
* Calcul des dividendes en EUR.
* Calcul des custody fees par période.
* Tableaux générés automatiquement :

  * plus-values par entreprise,
  * dividendes par entreprise,
  * fees globaux,
  * total par période.
* Mode **agrégation mensuelle ou annuelle**.
* Interface élégante, responsive.
* **Ligne TOTAL sticky** + scroll visible et stable.
* Aucun backend, aucune donnée envoyée. **Tout est local**.

---

## 🧠 Rappel fiscal (France)

La fiscalité française impose la méthode du **PMP – Prix Moyen Pondéré** :

### Achat

```text
PMP_nouveau = (PMP × quantité_existante + prix_achat_eur × quantité_achetée)
               / (quantité_existante + quantité_achetée)
```

### Vente

```text
Plus-value = quantité_vendue × (prix_vente_eur - PMP)
```

### Important

* Les **dividendes** ne sont pas intégrés dans les plus-values : ils relèvent des **revenus de capitaux mobiliers** (PFU 30% / IR).
* Les **custody fees** ne sont pas déductibles fiscalement, mais comptent dans la performance réelle.
* Les **stock splits** ajustent la quantité et le PMP mais pas la valeur globale.

### Sources officielles

* BOFiP – Plus-values mobilières : [https://bofip.impots.gouv.fr/bofip/3619-PGP.html/identifiant%3DBOI-RPPM-PVBMI-20-10-20-40-20191220](https://bofip.impots.gouv.fr/bofip/3619-PGP.html/identifiant%3DBOI-RPPM-PVBMI-20-10-20-40-20191220)
* Service Public – Fiscalité sur les plus values mobilies : [https://www.service-public.gouv.fr/particuliers/vosdroits/F21618](https://www.service-public.gouv.fr/particuliers/vosdroits/F21618)
* BOFiP – Dividendes / RCM : [https://bofip.impots.gouv.fr/bofip/12144-PGP](https://bofip.impots.gouv.fr/bofip/12144-PGP)

---

## 🖼️ Aperçu

TODO

---

## 🚀 Utilisation

Tu peux utiliser le calculateur directement depuis le [lien suivant](https://artixjp.github.io/revolut-plus-value-impots-fr/src/) (tout est exécuté dans ton navigateur pour garantir la confidentialité de tes données).

Tu peux aussi lancer directement la page depuis ton ordinateur par la procédure suivante : 

1. Clone ou télécharge le repo :

```bash
git clone https://github.com/ArtixJP/revolut-plus-value-impots-fr
cd revolut-plus-value-impots-fr
```

2. Ouvre simplement le fichier :

```
index.html
```

dans ton navigateur.

3. Upload ton CSV Revolut (pense à bien extraire l'intégralité de tes transactions ; l'historique global est très important pour la méthode du PMP).
4. Choisis l’agrégation (mois ou année).
5. Les tableaux s’affichent automatiquement.

---

## 📁 Structure du projet

```
/
├── index.html        # Interface utilisateur
├── styles.css        # Design et mise en forme
├── analytics.js      # Algorithmes de calcul (PMP, dividendes, FX…)
└── app.js            # Gestion UI, parsing, rendu des tableaux
```

Chaque fichier est isolé pour permettre :

* auditabilité du code,
* contribution facilitée,
* clarté de la séparation logique,
* réutilisation dans d'autres projets.

---

## 🤝 Contributions

Les contributions sont **les bienvenues** :

* Ajout d’un export CSV / PDF
* Support d’autres brokers (Degiro, eToro, IBKR…)
* Mode “performance réelle” vs “fiscale”
* Calcul complet pour l’impôt (RCM + PV + abattements)
* Interface anglophone / bilingue

Merci d’ouvrir une issue ou une pull request.

---

## 🧑‍💻 Auteur

**Jules Pondard**

Fondateur – **Artix Technologies**

GitHub : [https://github.com/ArtixJP](https://github.com/ArtixJP)

LinkedIn : [https://www.linkedin.com/in/julespondard/](https://www.linkedin.com/in/julespondard/)

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**, afin de permettre :

* la réutilisation libre,
* l’intégration dans des outils tiers,
* les forks éducatifs ou commerciaux.

---

## ⭐ Support

Si ce projet t’a été utile, pense à mettre une étoile ⭐ sur GitHub :

👉 [https://github.com/ArtixJP/revolut-plus-value-impots-fr](https://github.com/ArtixJP/revolut-plus-value-impots-fr)
