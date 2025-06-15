import { UUID } from "crypto";
import { fetchComments, likeMedia, postComment } from "../lib/actions";
import { getIgClient } from "../lib/state";
import type { InstagramState } from "../types";

// Templates
const instagramCommentTemplate = `
  # Areas of Expertise
  {{knowledge}}

  # About {{agentName}} (@{{instagramUsername}}):
  {{bio}}
  {{lore}}
  {{topics}}

  {{providers}}

  {{characterPostExamples}}

  {{postDirections}}

  # Task: Generate a response to the following Instagram comment in the voice and style of {{agentName}}.
  Original Comment (@{{commentUsername}}): {{commentText}}

  Your response should be friendly, engaging, and natural. Keep it brief (1-2 sentences).
  Do not use hashtags in comment responses. Be conversational and authentic.`;

const shouldInteractTemplate = `
  # About {{agentName}} (@{{instagramUsername}}):
  {{bio}}
  {{lore}}
  {{topics}}

  {{postDirections}}

  # Task: Determine if {{agentName}} should interact with this content:
  Interaction Type: {{interactionType}}
  User: @{{username}}
  Content: {{content}}

  Consider:
  1. Is this user's content relevant to {{agentName}}'s interests?
  2. Would interaction be authentic and meaningful?
  3. Is there potential for valuable engagement?

  Respond with one of:
  [INTERACT] - Content is highly relevant and engagement would be valuable
  [SKIP] - Content is not relevant enough or engagement wouldn't be authentic

  Choose [INTERACT] only if very confident about relevance and value.`;

export class InstagramInteractionService {
  private state: InstagramState;
  private isProcessing = false;
  private stopProcessing = false;

  constructor(state: InstagramState) {
    this.state = state;
  }

  // async start() {
  //   const handleInteractionsLoop = () => {
  //     this.handleInteractions();
  //     if (!this.stopProcessing) {
  //       setTimeout(
  //         handleInteractionsLoop,
  //         Number.parseInt(process.env.INSTAGRAM_ACTION_INTERVAL || '300', 10) * 1000
  //       );
  //     }
  //   };

  //   handleInteractionsLoop();
  // }

  async stop() {
    this.stopProcessing = true;
  }

  private async generateResponse(
    text: string,
    username: string,
    action: string
  ) {
    // const state = await this.runtime.composeState(
    //   {
    //     userId: this.runtime.agentId,
    //     roomId: stringToUuid(`instagram-temp-${Date.now()}-${this.runtime.agentId}`),
    //     agentId: this.runtime.agentId,
    //     content: {
    //       text,
    //       action,
    //     },
    //   },
    //   {
    //     instagramUsername: this.state.profile?.username,
    //     commentUsername: username,
    //     commentText: text,
    //   }
    // );

    // const context = composeContext({
    //   state,
    //   template: instagramCommentTemplate,
    // });

    // const response = await generateText({
    //   runtime: this.runtime,
    //   context,
    //   modelClass: ModelClass.SMALL,
    // });

    // return this.cleanResponse(response);
  }

  private cleanResponse(response: string): string {
    return response
      .replace(/^\s*{?\s*"text":\s*"|"\s*}?\s*$/g, "")
      .replace(/^['"](.*)['"]$/g, "$1")
      .replace(/\\"/g, '"')
      .trim();
  }

  private async handleInteractions() {
    if (this.isProcessing) {
      console.log("Already processing interactions, skipping");
      return;
    }

    try {
      this.isProcessing = true;
      console.log("Checking Instagram interactions");

      const ig = getIgClient();
      const activity = await ig.feed.news().items();

      for (const item of activity) {
        const activityId = `instagram-activity-${item.pk}`;
        // if (await this.runtime.cacheManager.get(activityId)) continue;

        switch (item.type) {
          case 2: // Comment on your post
            await this.handleComment(item);
            break;
          case 3: // Like on your post
            await this.handleLike(item);
            break;
          case 12: // Mention in comment
            await this.handleMention(item);
            break;
        }

        // await this.runtime.cacheManager.set(activityId, true);
      }
    } catch (error) {
      console.error("Error handling Instagram interactions:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  async getComments(media_id: string) {
    const comments = await fetchComments(media_id);
    return comments;
  }

  async sendDM(username: string = "shoonya_store") {
    const ig = getIgClient();
    const userId = await ig.user.getIdByUsername(username);
    const thread = ig.entity.directThread([userId.toString()]);
    const res = await thread.broadcastText('Automated Message from node: Brijesh');
    console.log("Msg sent details if found: ", res);
  }

  async commentOnPost(username: string = "shoonya_store", limit: number = 5) {
    const ig = getIgClient();
    try {
      // Get user ID from username
      const userId = await ig.user.getIdByUsername(username);
      console.log(username + " UserId: " + userId);

      // Get user feed
      const userFeed = ig.feed.user(userId);
      console.log({ userFeed });

      // Get the latest posts with specified limit
      const page = await userFeed.request();
      const posts = page.items.slice(0, 5);
      console.log({ posts });

      if (!posts || posts.length === 0) {
        console.log(`No posts found for user ${username}`);
        return;
      }

      // Take only the specified number of posts
      const limitedPosts = posts.slice(0, limit);

      // Log raw post data to inspect structure
      console.log('Raw post data:', JSON.stringify(limitedPosts[0], null, 2));

      // Log each post's details
      limitedPosts.forEach((post, index) => {
        console.log(`Post ${index + 1}:`, {
          id: post.id,
          caption: post.caption?.text,
          taken_at: new Date(post.taken_at * 1000).toISOString(),
          like_count: post.like_count,
          comment_count: post.comment_count,
          // Log all available properties
          raw_data: post
        });
      });

      return {
        posts: limitedPosts.map(post => ({
          id: post.id,
          caption: post.caption?.text,
          taken_at: new Date(post.taken_at * 1000).toISOString(),
          like_count: post.like_count,
          comment_count: post.comment_count,
          // Include all available properties
          raw_data: post
        }))
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  private async handleComment(item: any) {
    try {
      const comments = await fetchComments(item.media_id);
      const comment = comments.find(c => c.id === item.pk.toString());
      if (!comment) return;

      // const roomId = stringToUuid(`instagram-comment-${item.media_id}-`);
      // const commentId = stringToUuid(`instagram-comment-${comment.id}-`);
      // const userId = stringToUuid(`instagram-user-${item.user_id}-`);
      // const roomId = stringToUuid(`instagram-comment-${item.media_id}-${this.runtime.agentId}`);
      // const commentId = stringToUuid(`instagram-comment-${comment.id}-${this.runtime.agentId}`);
      // const userId = stringToUuid(`instagram-user-${item.user_id}-${this.runtime.agentId}`);

      const cleanedResponse = await this.generateResponse(
        comment.text,
        comment.username,
        "COMMENT"
      );

      // if (!cleanedResponse) {
      //   console.error("Failed to generate valid comment response");
      //   return;
      // }

      // await this.ensureEntities(roomId, userId, comment.username);
      // await this.createInteractionMemories(
      //   commentId,
      //   userId,
      //   roomId,
      //   comment,
      //   cleanedResponse,
      //   item.media_id
      // );

    } catch (error) {
      console.error("Error handling comment:", error);
    }
  }

  private async handleLike(item: any) {
    try {
      // const state = await this.runtime.composeState(
      //   {
      //     userId: this.runtime.agentId,
      //     roomId: stringToUuid(`instagram-like-${item.media_id}-${this.runtime.agentId}`),
      //     agentId: this.runtime.agentId,
      //     content: { text: "", action: "DECIDE_INTERACTION" },
      //   },
      //   {
      //     instagramUsername: this.state.profile?.username,
      //     interactionType: "like",
      //     username: item.user?.username,
      //     content: item.text || "",
      //   }
      // );

      // const context = composeContext({ state, template: shouldInteractTemplate });
      // const decision = await generateText({
      //   runtime: this.runtime,
      //   context,
      //   modelClass: ModelType.SMALL,
      // });

      // if (decision.includes("[INTERACT]")) {
      const userFeed = await getIgClient().feed.user(item.user_id).items();
      if (userFeed.length > 0) {
        await likeMedia(userFeed[0].id);
        console.log(`Liked post from user: ${item.user?.username}`);
        // }
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  }

  private async handleMention(item: any) {
    try {
      // const roomId = stringToUuid(`instagram-mention-${item.media_id}-${this.runtime.agentId}`);
      // const mentionId = stringToUuid(`instagram-mention-${item.pk}-${this.runtime.agentId}`);
      // const userId = stringToUuid(`instagram-user-${item.user.pk}-${this.runtime.agentId}`);

      const cleanedResponse = await this.generateResponse(
        item.text,
        item.user.username,
        "MENTION"
      );

      // if (!cleanedResponse) {
      //   console.error("Failed to generate valid mention response");
      //   return;
      // }

      // await this.ensureEntities(roomId, userId, item.user.username);
      // await this.createInteractionMemories(
      //   mentionId,
      //   userId,
      //   roomId,
      //   item,
      //   cleanedResponse,
      //   item.media_id
      // );

    } catch (error) {
      console.error("Error handling mention:", error);
    }
  }

  private async ensureEntities(roomId: UUID, userId: UUID, username: string) {
    // await this.runtime.ensureRoomExists(roomId);
    // await this.runtime.ensureUserExists(userId, username, username, "instagram");
    // await this.runtime.ensureParticipantInRoom(this.runtime.agentId, roomId);
  }

  private async createInteractionMemories(
    originalId: UUID,
    userId: UUID,
    roomId: UUID,
    originalItem: any,
    response: string,
    mediaId: string
  ) {
    // Create memory of original interaction
    // await this.runtime.messageManager.createMemory({
    //   id: originalId,
    //   userId,
    //   agentId: this.runtime.agentId,
    //   content: {
    //     text: originalItem.text,
    //     source: "instagram",
    //   },
    //   roomId,
    //   embedding: getEmbeddingZeroVector(),
    //   createdAt: new Date(originalItem.timestamp || originalItem.created_at * 1000).getTime(),
    // });

    // Post response
    const postedComment = await postComment(mediaId, response);

    // Create memory of our response
    // await this.runtime.messageManager.createMemory({
    //   id: stringToUuid(`instagram-reply-${postedComment.id}-${this.runtime.agentId}`),
    //   userId: this.runtime.agentId,
    //   agentId: this.runtime.agentId,
    //   content: {
    //     text: response,
    //     source: "instagram",
    //     inReplyTo: originalId
    //   },
    //   roomId,
    //   embedding: getEmbeddingZeroVector(),
    //   createdAt: Date.now(),
    // });
  }
}