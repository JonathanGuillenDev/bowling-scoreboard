class BowlingGame:
    def __init__(self):
        self.num_players = 0
        self.players = []                                   # holds player names and player order
        self.strike_or_spare = [[[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []]]             # holds X or / for strikes and spares
        self.frame_scores = [[[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []], [[], [], [], [], [], [], [], [], [], []]]                # holds the score for each frame

    def start_game(self):                                   #starts the game
        print("Welcome to Bowling Scorer!")
        try:
            self.num_players = int(input("Enter the number of players (1-4): "))
            if not 1 <= self.num_players <= 4:
                raise ValueError("Invalid number of players. Please choose between 1 and 4.")
            for i in range(self.num_players):
                player_name = input(f"Enter name for Player {i + 1}: ")
                self.players.append({"name": player_name, "total_score": 0})
        except ValueError as e:
            print(e)
            self.start_game()

    def play_game(self):                                    #plays the game and asks for input for each roll for each frame from each player
        for frame_index in range(10):
            for player_index in range(len(self.players)):
                print(f"\n{self.players[player_index]['name']}'s turn (Frame {frame_index+1})")
                roll1 = self.input_roll()
               
                if roll1 == 10:
                    self.strike_or_spare[player_index][frame_index].append("X")
                    self.frame_scores[player_index][frame_index].append(10)
                    print("Strike!")
                    if frame_index == 9:
                        print("2 Bonus rolls!")
                        roll2 = self.input_roll()
                        self.frame_scores[player_index][frame_index].append(roll2)
                        if roll2 != 10:
                            while True:
                                try:
                                    roll3 = int(input(f"Enter pins knocked down (0-{10-roll2}): "))
                                    if 0 <= roll3 <= 10-roll2:
                                        break
                                    else:
                                        print(f"Invalid input. Enter a number between 0 and {10-roll2}.")
                                except ValueError:
                                    print("Invalid input. Enter a number.")
                            self.frame_scores[player_index][frame_index].append(roll3)
                        else:
                            self.frame_scores[player_index][frame_index].append(roll3)
                    continue
               
                self.frame_scores[player_index][frame_index].append(roll1)
                while True:
                    try:
                        roll2 = int(input(f"Enter pins knocked down (0-{10-roll1}): "))
                        if 0 <= roll2 <= 10-roll1:
                            break
                        else:
                            print(f"Invalid input. Enter a number between 0 and {10-roll1}.")
                    except ValueError:
                        print("Invalid input. Enter a number.")
                if roll1 + roll2 == 10:
                    self.strike_or_spare[player_index][frame_index].append("/")
                    self.frame_scores[player_index][frame_index].append(roll2)
                    print("Spare!")
                    if frame_index == 9:
                        print("1 Bonus roll!")
                        roll3 = self.input_roll()
                        self.frame_scores[player_index][frame_index].append(roll3)
                    continue
                else:
                    self.frame_scores[player_index][frame_index].append(roll2)

    def input_roll(self, max_pins=10):                          #handles input for each roll, check to ensure between 0 and 10 pins knocked down
        while True:
            try:
                roll = int(input(f"Enter pins knocked down (0-{max_pins}): "))
                if 0 <= roll <= max_pins:
                    return roll
                else:
                    print("Invalid input. Try again.")
            except ValueError:
                print("Invalid input. Enter a number.")

    def calculate_frame_scores(self):                           #at the end of the game, calculates the score for each frame based on the rolls and strikes/spares
        for frame_index in range(9):
            for player_index in range(self.num_players):
                if self.is_strike(player_index, frame_index):
                    if frame_index == 8:                        #if 9th frame
                        self.frame_scores[player_index][frame_index].append(self.frame_scores[player_index][frame_index+1][0] + self.frame_scores[player_index][frame_index+1][1])
                    elif self.is_strike(player_index,frame_index+1):        #if next roll is also a strike
                        self.frame_scores[player_index][frame_index].append(self.frame_scores[player_index][frame_index+1][0] + self.frame_scores[player_index][frame_index+2][0])
                    else:
                        self.frame_scores[player_index][frame_index].append(self.frame_scores[player_index][frame_index+1][0] + self.frame_scores[player_index][frame_index+1][1])
                elif self.is_spare(player_index, frame_index):
                    self.frame_scores[player_index][frame_index].append(self.frame_scores[player_index][frame_index+1][0])
                else:
                    self.frame_scores[player_index][frame_index] = sum(self.frame_scores[player_index][frame_index])

                    #sum final frame for each player
        for player_index in range(self.num_players):       
            self.frame_scores[player_index][9] = sum(self.frame_scores[player_index][9])

    def is_strike(self, player_index, frame_index):
        return self.strike_or_spare[player_index][frame_index] == "X"
    
    def is_spare(self, player_index, frame_index):
        return self.strike_or_spare[player_index][frame_index] == "/"

    def show_frame_scores(self, frame):
        for player in range(self.num_players):
            frame_score = self.frame_scores[player][frame]
            print(f"{self.players[player]['name']}'s score for Frame {frame + 1}: {frame_score}")

    def show_game_scores(self):
        for player_index in range(self.num_players):
            total_score = []
            for frame_index in range(10):
                total_score.append(self.frame_scores[player_index][frame_index])
            print(f"{self.players[player_index]['name']}'s total score: {sum(total_score)}")

    def end_program(self):
        print("Thank you for using the Bowling Scorer!")

    def end_menu(self):                                             #menu for end of game, allows user to choose to see frame scores, game scores, play again, or end program
        while True:
            print("\nOptions:")
            print("1. Input a frame number to return frame scores.")
            print("2. Return game scores.")
            print("3. End the program.")
            choice = input("Enter your choice (1/2/3/4): ")
            if choice == "1":
                frame_number = int(input("Enter frame number (1-10): "))
                if 1 <= frame_number <= 10:
                    self.show_frame_scores(frame_number-1)
                else:
                    print("Invalid frame number. Please enter a number between 1 and 10.")
            elif choice == "2":
                self.show_game_scores()
            elif choice == "3":
                self.end_program()
                break
            else:
                print("Invalid choice. Please choose a valid option (1/2/3/4).")

#runs the program
if __name__ == "__main__":
    game = BowlingGame()
    game.start_game()
    game.play_game()
    game.calculate_frame_scores()
    game.end_menu()