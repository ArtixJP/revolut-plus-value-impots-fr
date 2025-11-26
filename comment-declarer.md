# Comment déclarer vos plus-values et dividendes Revolut (France)

Ce guide explique comment reporter dans votre déclaration d’impôts française les montants calculés par ce script :

- **plus-value nette annuelle** (ou moins-value nette)  
- **dividendes perçus** (nets et retenues à la source éventuelles)

Les règles qui suivent s’appliquent aux particuliers résidents fiscaux français.

---

## 1. Déclarer vos plus-values / moins-values

Les gains ou pertes réalisés sur actions / ETF via Revolut se déclarent dans :

**Formulaire 2042 C**  
Rubrique : _Plus-values et moins-values sur valeurs mobilières_

Vous devez remplir **une seule case** selon votre résultat net annuel :

- **3VG** : si votre résultat net est **positif** (plus-value)  
- **3VH** : si votre résultat net est **négatif** (moins-value)

Le script calcule ce résultat en appliquant la méthode officielle du **prix moyen d’acquisition (PMA)**.

### Exemple

Résultat du script : `+ 250 €`  

→ Reporter `250` en **3VG**

Résultat du script : `- 370 €`  

→ Reporter `370` en **3VH**

Note : vous ne déclarez **pas** chaque action individuellement, mais seulement le **résultat net global**.

---

## 2. Déclarer vos dividendes

Les dividendes sont des **revenus mobiliers**, distincts des plus-values.

Ils se déclarent dans :

**Formulaire 2042**  
Rubrique : _Revenus des valeurs et capitaux mobiliers_

Par défaut :

- **Case 2DC** : dividendes soumis au **PFU (flat tax) de 30 %**

Si vous choisissez le barème progressif : case **2TS** (peu fréquent).

### Montant à déclarer  
Vous devez déclarer le **montant brut** des dividendes :

```

dividende_brut = dividende_net + retenue_étrangère

```

Remarque :  

Revolut verse souvent les dividendes **nets** de la retenue américaine (15 %).  

Ajoutez cette retenue pour obtenir le montant brut.

---

## 3. Crédit d’impôt pour la retenue étrangère (formulaire 2047)

Pour éviter la double imposition des dividendes étrangers (ex : actions US), vous devez aussi remplir :

**Formulaire 2047**  
Rubrique : _Revenus encaissés à l’étranger ouvrant droit à crédit d’impôt_

Vous y indiquez le **montant de la retenue étrangère** prélevée (ex : 15 % pour les dividendes US).

L’administration appliquera automatiquement un crédit d’impôt.

---

## 4. Exemple complet

Résultats du script :

```

Plus-value nette : +250 €
Dividendes nets : 23 €
Retenue US : 4 €
Dividendes bruts : 27 €

```

Déclaration :

- **3VG (2042 C)** → 250  
- **2DC (2042)** → 27  
- **2047 (crédit d’impôt)** → 4  

---

## 5. Justificatifs à conserver

Conservez pendant **3 ans** :

- l’export CSV Revolut (transactions + dividendes)  
- le résultat généré par le script  
- vos relevés Revolut  
- toute preuve de la retenue étrangère

---

## 6. Cas particuliers

- **Aucun titre vendu** → rien en 3VG/3VH ; déclarer les dividendes si présents  
- **Uniquement des pertes** → case 3VH  
- **Plusieurs courtiers** → agréger les montants avant déclaration  
- **ETF étrangers** → appliquer la même logique (brut = net + retenue ; credit d’impôt via 2047)  

---

## Disclaimer

Ce guide n’est pas un conseil fiscal personnalisé.  

Il présente les règles générales applicables aux particuliers en France.  

L’utilisateur reste responsable des montants déclarés. 

En cas de doute, rapprochez-vous d’un professionnel ou de l’administration fiscale.
