import { IImageComment, useGlobalProvider } from "@/lib/globalProvider";
import { useAbstraxionAccount } from "@burnt-labs/abstraxion";
import React, { useEffect, useState } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

const comments = [
  {
    comment_id: "rmpydc3jqy6uzjr51178",
    image_id: "rdengmcabbr9gh975ajg",
    author: "xion1d4tw7shjenuht52jhac8v9vp48jypyl7uj30y62qywzrmpydc3jqy6uzjr",
    comment: "hi",
    timestamp: "1744497351178",
  },
];
const ImageComments = ({ imageId }: { imageId: string }) => {
  const { data: account } = useAbstraxionAccount();
  const {
    getImageComments,
    createComment,
    loadingMessages,
    getComment,
    isRegistered,
  } = useGlobalProvider();
  const [newComment, setNewComment] = React.useState("");
  const [comments, setComments] = useState<IImageComment[]>([
    {
      comment_id: "rmpydc3jqy6uzjr51178",
      image_id: "rdengmcabbr9gh975ajg",
      author: "xion1d4tw7shjenuht52jhac8v9vp48jypyl7uj30y62qywzrmpydc3jqy6uzjr",
      comment: "hi",
      timestamp: "1744497351178",
    },
  ]);
  // const {data:client}

  useEffect(() => {
    if (account) {
      getImageComments(imageId).then((res) => {
        let commentDataPromises = Promise.all(
          res?.map((comment_id: string) => {
            return getComment(comment_id);
          })
        );

        commentDataPromises
          .then((data) => {
            // console.log("Comment Data", data);
            setComments(data);
          })
          .catch((error) => {
            console.error("Error fetching image data:", error);
          });
      });
    }
  }, [account]);

  const handleAddComment = async () => {
    if (isRegistered !== 1) {
      toast("Please authenticate first", {
        icon: "⚠️",
      });
      return;
    }
    if (newComment.length > 100) {
      toast("Comment too long", {
        icon: "⚠️",
        duration: 2000,
      });
      return;
    }

    let currentDate = Date.now();
    let comment_id = `${account?.bech32Address.slice(-15)}${currentDate
      .toString()
      .slice(-5)}`;
    await createComment({
      image_id: imageId,
      comment: newComment,
      comment_id: comment_id,
      author: account?.bech32Address,
      timestamp: currentDate,
    })
      .then((res) => {
        // console.log("Comment added", res);

        toast("Comment added", {
          icon: "✅",
          duration: 2000,
        });
      })
      .catch((err) => {
        console.error("Error adding comment", err);
        toast("Error adding comment", {
          icon: "❌",
          duration: 2000,
        });
      });

    setNewComment("");
  };
  return (
    <div>
      <div className="flex flex-col gap-2 items-end">
        <Textarea
          className="border border-white"
          onChange={(e) => {
            if (e.target.value.length > 100) {
              toast("Comment too long", {
                icon: "⚠️",
                duration: 2000,
              });
            }
            setNewComment(e.target.value);
          }}
          value={newComment}
        />
        <Button
          variant="outline"
          onClick={handleAddComment}
          disabled={loadingMessages}
        >
          Add Comment
        </Button>
      </div>
      <div className="mt-4 w-full flex flex-col gap-2 ">
        {comments?.map((comment) => {
          const commentTime = new Date(Number(comment.timestamp));
          return (
            <div
              className="w-full border border-gray-500/50 p-4 relative rounded-lg"
              key={comment.comment_id}
            >
              <small className="px-4 py-1 italic bg-primary/20 text-primary rounded-2xl  ">
                {comment.author.slice(0, 5) + "..." + comment.author.slice(-5)}
              </small>
              <p className="text-lg font-semibold my-1">{comment.comment}</p>
              <small className="absolute bottom-1 right-1">
                {commentTime.getDate().toString().padStart(2, "0") +
                  "/" +
                  (commentTime.getMonth() + 1).toString().padStart(2, "0") +
                  "/" +
                  commentTime.getFullYear().toString()}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageComments;
