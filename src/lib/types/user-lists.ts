import type { BeachListItemDto } from "@/lib/types/beach-list";

export type ListAccessLevel = "VIEW" | "REVIEWER" | "EDIT";

export type SharePrincipalType = "USER" | "GROUP" | "EMAIL";

export type ShareStatus = "ACTIVE" | "PENDING" | "REVOKED";

export type ListItemSort = "created_desc" | "rating_desc" | "rating_asc";

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
};

export type UserListSummary = {
  id: number;
  name: string;
  itemCount: number;
  createdAt: string;
};

export type UserListResponse = {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UserListCreateRequest = {
  name: string;
  description?: string;
};

export type UserListUpdateRequest = {
  name?: string;
  description?: string;
};

export type UserListItemDto = {
  poi: BeachListItemDto;
  addedAt: string;
  aggregateRating: number | null;
  ratingsCount: number;
  myRating: number | null;
};

export type SharedUserListSummary = {
  id: number;
  name: string;
  itemCount: number;
  accessLevel: ListAccessLevel;
  ownerDisplayName: string;
  createdAt: string;
};

export type ListShareDto = {
  id: number;
  principalType: SharePrincipalType;
  targetUserId: number | null;
  targetGroupId: number | null;
  inviteEmail: string | null;
  accessLevel: ListAccessLevel;
  status: ShareStatus;
  createdAt: string;
  updatedAt: string;
};

export type ListShareUserRequest = {
  principalType: "USER";
  targetUserId: number;
  accessLevel: ListAccessLevel;
};

export type ListShareGroupRequest = {
  principalType: "GROUP";
  targetGroupId: number;
  accessLevel: ListAccessLevel;
};

export type ListShareEmailRequest = {
  principalType: "EMAIL";
  emails: string[];
  accessLevel: ListAccessLevel;
};

export type ListShareCreateRequest =
  | ListShareUserRequest
  | ListShareGroupRequest
  | ListShareEmailRequest;

export type ListShareUpdateRequest = {
  accessLevel: ListAccessLevel;
};

export type RatingRequest = {
  rating: 1 | 2 | 3;
};

export type ListTeaserPoi = {
  id: number;
  name: string;
  photoUrl: string | null;
};

export type ListTeaserResponse = {
  listName: string;
  previewPois: ListTeaserPoi[];
  totalCount: number;
  registrationRequired: boolean;
};
