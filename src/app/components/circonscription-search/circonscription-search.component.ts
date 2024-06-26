import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';

interface Circonscription {
  name: string;
  label: string;
  legislatives: {
    '1er': Array<{ name: string; vote: number; 'vote%': number; 'vote%inscrits'?: number }>;
    '2e': Array<{ name: string; vote: number; 'vote%': number }>;
    winner?: string;
  };
}
@Component({
  selector: 'app-circonscription-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatFormFieldModule, MatAutocompleteModule, MatCardModule],
  templateUrl: './circonscription-search.component.html',
  styleUrl: './circonscription-search.component.scss'
})


export class CirconscriptionSearchComponent {
  circonscriptions = input.required<Circonscription[]>();
  
  searchTerm = signal('');
  selectedCirconscription = signal<Circonscription | null>(null);

  filteredCirconscriptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.circonscriptions().filter(circ => 
      circ.name.toLowerCase().includes(term) || circ.label.toLowerCase().includes(term)
    );
  });

  updateSearch() {
    this.selectedCirconscription.set(null);
  }

  onOptionSelected(event: any) {
    const selectedName = event.option.value;
    const selected = this.circonscriptions().find(circ => circ.label === selectedName);
    this.selectedCirconscription.set(selected || null);
  }
}