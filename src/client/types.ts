export interface Work {
    id: number;
    title: string;
    description: string;
    image: string;
    author_name: string;
    author_bio: string;
  }

export interface WorkUser extends Work {
    tx_created_at: string;
    claimUrl: string;
  }

export interface WorkSale extends Work {
    price: number;
    seller_name: string;
  }