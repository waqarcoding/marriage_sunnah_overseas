import 'package:app/features/match/match_controller.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:swipe_cards/swipe_cards.dart';

class SwipePage extends StatefulWidget {
  const SwipePage({super.key});

  @override
  State<SwipePage> createState() => _SwipePageState();
}

class _SwipePageState extends State<SwipePage> {
  final MatchController controller = Get.find<MatchController>();

  late MatchEngine _matchEngine;

  @override
  void initState() {
    super.initState();
    controller.fetchMatches().then((_) => _initMatchEngine());
  }

  void _initMatchEngine() {
    final swipeItems =
        controller.matches
            .map(
              (user) => SwipeItem(
                content: user,
                likeAction: () {
                  controller.likeUser(user['id']);
                },
                nopeAction: () {
                  controller.dislikeUser(user['id']);
                },
                superlikeAction: () {},
              ),
            )
            .toList();

    setState(() {
      _matchEngine = MatchEngine(swipeItems: swipeItems);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Swipe Matches")),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        if (controller.errorMessage.isNotEmpty) {
          return Center(
            child: Text(
              controller.errorMessage.value,
              style: const TextStyle(color: Colors.red),
            ),
          );
        }

        if (controller.matches.isEmpty) {
          return const Center(child: Text("No matches to swipe."));
        }

        if (_matchEngine == null) {
          return const Center(child: CircularProgressIndicator());
        }

        return Column(
          children: [
            Expanded(
              child: SwipeCards(
                matchEngine: _matchEngine,
                itemBuilder: (context, index) {
                  final user = controller.matches[index];
                  return Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 80,
                          backgroundImage:
                              user['photo'] != null
                                  ? NetworkImage(user['photo'])
                                  : null,
                          child:
                              user['photo'] == null
                                  ? const Icon(Icons.person, size: 80)
                                  : null,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          user['name'] ?? 'Unknown',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          user['bio'] ?? '',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ],
                    ),
                  );
                },
                onStackFinished: () {
                  Get.snackbar("Finished", "No more users to swipe.");
                },
                itemChanged: (index, user) {
                  // optional: track current index
                },
                upSwipeAllowed: false,
                fillSpace: true,
              ),
            ),

            // Like/Dislike Buttons
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _matchEngine.currentItem?.nope(),
                    icon: const Icon(Icons.close),
                    label: const Text("Dislike"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _matchEngine.currentItem?.like(),
                    icon: const Icon(Icons.favorite),
                    label: const Text("Like"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      }),
    );
  }
}
