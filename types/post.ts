export interface Post {
  id: string;
  user_id: string;
  text: string;
  image_url: string | null;
  created_at: string;
  profiles?: {
    email?: string;
    display_name?: string;
  };
}
