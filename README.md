# PROSTY SILNIK GRY 2D
Wciąż rozwijany silnik gry przeznaczony do gier 2D z rzutem z góry w przyszłości obsługujący w pełni:


### Renderowanie świata:
- Plansze zbudowane z kafelków(tiles) wczytywanych z układów kafelek(tilesets).
- Cały globalny świat podzielony na mniejsze światy składające się z kilku do kilkunastu planszy, aby ograniczyć zużycie zasobów
- Wczytywanie świata przed zaczęciem jego renderowania, aby zapewnić wczytanie wszystkich potrzebnych zasobów do pamięci
- Kolizje rozstrzygane w oparciu o LOKALNĄ DLA PLANSZY SIATKĘ KOLIZJI


### Kolizje:
- Postac-postac, postac-otocznie
- Świat podzielony na plansze, z których każda ma osobną siatkę logiczną (pozbawioną mankamentów kafelek, jak np. 1 kafelka - jedna kolizja do sprawdzenia, oraz niedokładnośc kolizji),


### Dialogi:
- Dialogi, które mają być bardzo łatwe do dodawania
- Obsługujące różne ramki wczytywane z pojedynczego pliku renderowanych w sposób taki jak kafelki
- Obsługa portretów postaci wyświetlanych nad oknem dialogowym


### Menu:
- Możliwie proste dodawanie nowych,
- Kilka różnych, możliwych do wyboru ustawień co do położenia tekstu

##### Aktualny stan
 
###### Dialogie jak i menu nie są do końca zaimplementowane, a kolizje są nieco mało elastyczne. Dialogi można wypróbować dodając linię "init_dialogue(abc);" do gameLoop po wywołaniu funkcji draw_current_world();
