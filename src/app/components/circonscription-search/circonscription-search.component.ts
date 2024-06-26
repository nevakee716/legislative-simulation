import { Component, input, signal, computed, effect } from '@angular/core';
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
  private selectedCirconscriptionLabel = signal<string | null>(null);

  filteredCirconscriptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.circonscriptions().filter(circ => 
      circ.name.toLowerCase().includes(term) || circ.label.toLowerCase().includes(term)
    );
  });

  selectedCirconscription = computed(() => {
    const label = this.selectedCirconscriptionLabel();
    return label ? this.circonscriptions().find(circ => circ.label === label) || null : null;
  });

  constructor() {
    effect(() => {
      // Vérifier si la circonscription sélectionnée existe toujours dans la nouvelle liste
      const currentLabel = this.selectedCirconscriptionLabel();
      if (currentLabel && !this.circonscriptions().some(circ => circ.label === currentLabel)) {
        this.selectedCirconscriptionLabel.set(null);
      }
    });
  }

  updateSearchTerm(newTerm: string) {
    this.searchTerm.set(newTerm);
  }

  onOptionSelected(event: any) {
    const selectedLabel = event.option.value;
    this.selectedCirconscriptionLabel.set(selectedLabel);
  }
}