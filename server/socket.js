const Chapter = require('./models/Chapter');
const NovelChapter = require('./models/NovelChapter');

// In-memory store for user presence
const chapterUsers = {};
const novelChapterUsers = {};

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
   
        
            // Join a chapter room
            socket.on('joinProject', ({ chapterId, username, profileImage }) => {
                if (!chapterId || !username || !profileImage) {
                    console.error('joinProject: Missing parameters');
                    return;
                }

                socket.join(chapterId); // Join the specific chapter room
                console.log(`Client ${socket.id} joined project: ${chapterId}`);

                // Track the user in the chapter with profileImage
                if (!chapterUsers[chapterId]) {
                    chapterUsers[chapterId] = {};
                }
                chapterUsers[chapterId][socket.id] = { username, profileImage };

                // Notify everyone in the room about the updated user list
                io.to(chapterId).emit('updateUserList', Object.values(chapterUsers[chapterId]));
            });

            // Handle content changes
            socket.on('sendChanges', async ({ chapterId, content }) => {
                console.log(`Updated chapter ${content} with new content`);

                if (!chapterId || content === undefined) {
                    console.error('sendChanges: Missing parameters');
                    return;
                }

                try {
                    // Update chapter content in the database
                    await Chapter.findByIdAndUpdate(chapterId, { content });
                    console.log(`Updated chapter ${chapterId} with new content`);

                    // Broadcast changes only to the room associated with the chapter
                    socket.to(chapterId).emit('receiveChanges', { chapterId, newContent: content });
                } catch (error) {
                    console.error('Error updating chapter content:', error);
                }
                
            });

           

        // ----------------- For novel chapters -----------------
        // Join a novel chapter room
        socket.on('noveljoinProject', ({ chapterId, username, profileImage }) => {
            if (!chapterId || !username || !profileImage) {
                console.error('noveljoinProject: Missing parameters');
                return;
            }

            socket.join(chapterId); // Join the specific novel chapter room
            console.log(`Client ${socket.id} joined novel project: ${chapterId}`);

            // Track the user in the novel chapter
            if (!novelChapterUsers[chapterId]) {
                novelChapterUsers[chapterId] = {};
            }
            novelChapterUsers[chapterId][socket.id] = { username, profileImage };

            // Notify everyone in the novel chapter room about the updated user list
            io.to(chapterId).emit('novelupdateUserList', Object.values(novelChapterUsers[chapterId]));
        });

        // Handle content changes for novel chapters
        socket.on('novelsendChanges', async ({ chapterId, content }) => {
            if (!chapterId || content === undefined) {
                console.error('novelsendChanges: Missing parameters');
                return;
            }

            try {
                // Update novel chapter content in the database
                await NovelChapter.findByIdAndUpdate(chapterId, { content });
                console.log(`Updated novel chapter ${chapterId} with new content`);

                // Broadcast changes only to the novel chapter room (excluding sender)
                socket.to(chapterId).emit('novelreceiveChanges', { chapterId, newContent: content });
            } catch (error) {
                console.error('Error updating novel chapter content:', error);
            }
        });

        // Handle leaving a standard chapter room
        socket.on('leaveProject', ({ chapterId, username }) => {
            if (!chapterId || !username) {
                console.error('leaveProject: Missing parameters');
                return;
            }

            socket.leave(chapterId);
            console.log(`Client ${socket.id} left standard project: ${chapterId}`);

            // Remove the user from the standard chapter tracking
            if (chapterUsers[chapterId] && chapterUsers[chapterId][socket.id]) {
                delete chapterUsers[chapterId][socket.id];
                // Notify remaining users in the standard chapter room
                io.to(chapterId).emit('updateUserList', Object.values(chapterUsers[chapterId]));
            }
        });

        // Handle leaving a novel chapter room
        socket.on('novelleaveProject', ({ chapterId, username }) => {
            if (!chapterId || !username) {
                console.error('novelleaveProject: Missing parameters');
                return;
            }

            socket.leave(chapterId);
            console.log(`Client ${socket.id} left novel project: ${chapterId}`);

            // Remove the user from the novel chapter tracking
            if (novelChapterUsers[chapterId] && novelChapterUsers[chapterId][socket.id]) {
                delete novelChapterUsers[chapterId][socket.id];
                // Notify remaining users in the novel chapter room
                io.to(chapterId).emit('novelupdateUserList', Object.values(novelChapterUsers[chapterId]));
            }
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);

            // Remove user from all standard chapters
            for (const chapterId in chapterUsers) {
                if (chapterUsers[chapterId][socket.id]) {
                    delete chapterUsers[chapterId][socket.id];
                    io.to(chapterId).emit('updateUserList', Object.values(chapterUsers[chapterId]));
                }
            }

            // Remove user from all novel chapters
            for (const chapterId in novelChapterUsers) {
                if (novelChapterUsers[chapterId][socket.id]) {
                    delete novelChapterUsers[chapterId][socket.id];
                    io.to(chapterId).emit('novelupdateUserList', Object.values(novelChapterUsers[chapterId]));
                }
            }
        });
    });
};

module.exports = initializeSocket;
