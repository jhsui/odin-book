-- CreateTable
CREATE TABLE "post_image" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "post_image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_image_path_key" ON "post_image"("path");

-- CreateIndex
CREATE INDEX "post_image_postId_idx" ON "post_image"("postId");

-- AddForeignKey
ALTER TABLE "post_image" ADD CONSTRAINT "post_image_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
