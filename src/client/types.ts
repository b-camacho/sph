export interface Work {
    id: number;
    title: string;
    description: string;
    image: string;
    author_name: string;
    author_bio: string;
  }

export interface WorkUser {
    id: number;
    title: string;
    description: string;
    image: string;
    author_name: string;
    author_bio: string;
    tx_created_at: string;
    claimUrl: string;
  }