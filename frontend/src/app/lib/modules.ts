// Registry materi: slug -> daftar topik dari JSON masing-masing.
// Jumlah topik dibaca dari JSON, jadi menambah topik tidak perlu mengubah apa pun di sini.

import accountTakeover from "../pembelajaran/account-takeover/account-takeover.json";
import advancedAttacks from "../pembelajaran/advanced-attacks/advanced-attacks.json";
import aiAttack from "../pembelajaran/ai-attack/ai-attack.json";
import dataBreach from "../pembelajaran/data-breach/data-breach.json";
import ddos from "../pembelajaran/ddos/ddos.json";
import ecommerceFraud from "../pembelajaran/ecommerce-fraud/ecommerce-fraud.json";
import malware from "../pembelajaran/malware/malware.json";
import mobileBanking from "../pembelajaran/mobile-banking/mobile-banking.json";
import networkAttack from "../pembelajaran/network-attack/network-attack.json";
import passwordAttack from "../pembelajaran/password-attack/password.json";
import phishing from "../pembelajaran/phishing/phishing.json";
import qrCodeAttack from "../pembelajaran/qr-code-attack/qr-code-attack.json";
import scamOnline from "../pembelajaran/scam-online/scam-online.json";
import socialEngineering from "../pembelajaran/social-engineering/social-engineering.json";
import webAttack from "../pembelajaran/web-attack/web-attack.json";
import wifiAttack from "../pembelajaran/wifi-attack/wifi-attack.json";

export interface ModuleMeta {
  title: string;
  topicIds: number[];
  topicLabels: string[];
}

const raw: Record<string, any> = {
  "account-takeover": accountTakeover,
  "advanced-attacks": advancedAttacks,
  "ai-attack": aiAttack,
  "data-breach": dataBreach,
  ddos,
  "ecommerce-fraud": ecommerceFraud,
  malware,
  "mobile-banking": mobileBanking,
  "network-attack": networkAttack,
  "password-attack": passwordAttack,
  phishing,
  "qr-code-attack": qrCodeAttack,
  "scam-online": scamOnline,
  "social-engineering": socialEngineering,
  "web-attack": webAttack,
  "wifi-attack": wifiAttack,
};

export const moduleMeta: Record<string, ModuleMeta> = Object.fromEntries(
  Object.entries(raw).map(([slug, d]) => [
    slug,
     {
      title: (d.title ?? slug) as string,
      topicIds: (d.navigation ?? []).map((n: any) => n.id as number),
      topicLabels: (d.navigation ?? []).map((n: any) => n.label as string),
    },
  ])
);
