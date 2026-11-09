# Relevé du solde snack (Proxirest)

Chaque jour (15:47 UTC, reprise 16:17), une tâche GitHub Actions (`.github/workflows/releve-snack.yml`) lit le solde du compte snack de chaque enfant
sur le site Proxirest, puis dépose le résultat **chiffré** dans ce dossier (`AAAA-MM-JJ.enc`).
Le texte clair n'est jamais publié : seule la clé privée, gardée hors du dépôt, peut le lire.
`cle-publique.pem` sert uniquement à chiffrer. Matricules et e-mail : secrets du dépôt, jamais dans un fichier.
Le script s'arrête avant tout paiement.
