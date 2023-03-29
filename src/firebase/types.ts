import { Card } from "../data/cards";

export interface IssueReport {
  card: Card;
  problematicAudio?: string;
  userId: string;
  userEmail: string;
  description: string;
}
