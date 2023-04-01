import { Card } from "../data/cards";

export interface IssueReport {
  card: Card;
  problematicAudio?: string;
  createdAt?: number;
  userId: string;
  userEmail: string;
  description: string;
}
